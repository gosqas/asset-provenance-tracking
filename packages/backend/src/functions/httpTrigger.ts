import { webcrypto as crypto } from 'node:crypto';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import * as bs58 from 'bs58';
import * as JSON5 from 'json5';


// To deploy this project from the command line, you need:
//  * Azure CLI : https://learn.microsoft.com/en-us/cli/azure/
//  * Azure Functions Core Tools: https://github.com/Azure/azure-functions-core-tools/blob/v4.x/README.md

// Once you've logged into Azure via 'az login' to an Azure account w/ PubInv permissions,
// you deploy this function project via this command:
//  > func azure functionapp publish gosqasbe

interface ProvenanceRecord {
    record: any,
    attachments?: readonly string[],
}

async function sha256(data: BufferSource) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

export function toHex(data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}

export function fromHex(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function decodeKey(key: string): Uint8Array {
    const $key = bs58.decode(key);
    switch ($key.length) {
        case 16:
        case 24:
        case 32:
            return $key
        default:
            throw new Error(`Invalid Key Length ${$key.length}`);
    }
}

export async function calculateDeviceID(key: string | Uint8Array): Promise<string> {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    const hash = await sha256(key);
    return toHex(hash);
}

const fnvPrime = 1099511628211n
const fnvOffset = 14695981039346656037n

function fnv1(input: Uint8Array): bigint {
    let hash = fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash = BigInt.asUintN(64, hash * fnvPrime)
        hash ^= BigInt(input[i])
    }
    return hash;
}

function calculateLegacyDeviceID(key: string | Uint8Array): bigint {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    return fnv1(key);
}

export async function encrypt(key: Uint8Array, data: BufferSource, salt?: Uint8Array): Promise<{ salt: Uint8Array; encryptedData: Uint8Array; }> {
    const $key = await crypto.subtle.importKey("raw", key.buffer, "AES-CBC", false, ['encrypt']);
    salt ??= crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv: salt }, $key, data);
    return { salt, encryptedData: new Uint8Array(encryptedData) };
}

export async function decrypt(key: Uint8Array, salt: Uint8Array, encryptedData: Uint8Array): Promise<Uint8Array> {
    const $key = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["decrypt"]);
    const result = await crypto.subtle.decrypt({ name: "AES-CBC", iv: salt }, $key, encryptedData);
    return new Uint8Array(result);
}

export async function upload(client: ContainerClient, deviceKey: Uint8Array, data: BufferSource, type: 'attach' | 'prov', contentType: string, timestamp: number, fileName: string | undefined): Promise<string> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey);
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    const blobID = toHex(await sha256(encryptedData));

    let blobName;
    if (type === 'prov') {
        blobName = `prov/${deviceID}/${blobID}`;
    } else if (type === 'attach') {
        blobName = `attach/${blobID}`;
    } else {
        throw new Error(`Invalid type provided: ${type}. Expected 'prov' or 'attach'.`);
    }

    const { encryptedData: encryptedName } = fileName
        ? await encrypt(deviceKey, new TextEncoder().encode(fileName), salt)
        : { encryptedData: undefined };

    await client.uploadBlockBlob(blobName, encryptedData.buffer, encryptedData.length, {
        metadata: {
            gdtcontenttype: contentType,
            gdthash: dataHash,
            gdtsalt: toHex(salt),
            gdttimestamp: `${timestamp}`,
            gdtname: encryptedName ? toHex(encryptedName) : ""
        },
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
    return blobID;
}

interface NamedBlob {
    name?: string,
    blob: Blob,
}

async function uploadProvenance(containerClient: ContainerClient, deviceKey: Uint8Array, timestamp: number, record: any, attachments: NamedBlob[]): Promise<{ record: string; attachments: NamedBlob[]; }> {

    const attachmentIDs = new Array<string>();
    for (const attach of attachments) {
        if (typeof attach === 'string') continue;
        const data = await attach.blob.arrayBuffer()
        const attachmentID = await upload(containerClient, deviceKey, data, "attach", attach.blob.type, timestamp, attach.name);
        attachmentIDs.push(attachmentID);
    }

    const provRecord = { record, attachments: attachmentIDs };
    const data = new TextEncoder().encode(JSON.stringify(provRecord));
    const recordID = await upload(containerClient, deviceKey, data, "prov", "application/json", timestamp, undefined);
    return { record: recordID, attachments };
}

interface DecryptedBlob {
    data: Uint8Array;
    contentType: string;
    timestamp: number;
    filename?: string;
}

async function decryptBlob(client: BlockBlobClient, deviceKey: Uint8Array): Promise<DecryptedBlob> {
    const props = await client.getProperties();
    const salt = props.metadata?.["gdtsalt"];
    if (!salt) throw new Error(`Missing Salt ${client.name}`);
    const timestamp = parseInt(props.metadata?.["gdttimestamp"]);
    if (isNaN(timestamp) || !isFinite(timestamp)) throw new Error(`Invalid Timestamp ${client.name}`);

    const buffer = await client.downloadToBuffer();
    const saltBuffer = fromHex(salt);
    const data = await decrypt(deviceKey, saltBuffer, buffer);
    const hash = props.metadata?.["gdthash"];
    if (hash) {
        if (!areEqual(fromHex(hash), await sha256(data))) {
            throw new Error(`Invalid Hash ${client.name}`);
        }
    }

    const contentType = props.metadata?.["gdtcontenttype"];
    const encryptedName = props.metadata?.["gdtname"] ?? "";
    const encodedName = encryptedName.length > 0 ? await decrypt(deviceKey, saltBuffer, fromHex(encryptedName)) : undefined;
    const filename = encodedName ? new TextDecoder().decode(encodedName) : undefined;

    return { data, contentType, timestamp, filename };

    function areEqual(first: Uint8Array, second: Uint8Array) {
        return first.length === second.length
            && first.every((value, index) => value === second[index]);
    }
}

async function pathExists(containerClient: ContainerClient, path: string) {
    const iterResult = await containerClient.listBlobsFlat({ prefix: path }).next();
    if (iterResult.done) {
        return false;
    } else {
        return true;
    }
}

async function convertLegacyProvenance(containerClient: ContainerClient, key: string | Uint8Array) {
    key = typeof key === 'string' ? decodeKey(key) : key;
    const deviceID = await calculateDeviceID(key);
    if (await pathExists(containerClient, `prov/${deviceID}`)) {
        return undefined; // already converted
    }

    const legacyDeviceID = calculateLegacyDeviceID(key);
    const records = new Array<unknown>();
    for await (const blob of containerClient.listBlobsFlat({ prefix: `legacy/prov/${legacyDeviceID}` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const { data, timestamp } = await decryptBlob(blobClient, key);
        const json = new TextDecoder().decode(data);
        const record = JSON.parse(json) as { attachments?: { attachmentID: string }[] };
        const attachmentIDs = record.attachments?.slice() ?? [];
        delete record.attachments;
        if ('name' in record) {
            const name = record['name'];
            record["deviceName"] = name;
        }

        const attachments = new Array<NamedBlob>();
        for (const attachment of attachmentIDs) {
            const attachmentClient = containerClient.getBlockBlobClient(`legacy/attach/${attachment.attachmentID}`);
            const { data, contentType, filename } = await decryptBlob(attachmentClient, key);
            attachments.push({
                blob: new Blob([data], { type: contentType }),
                name: filename
            });
        }

        const uploaded = await uploadProvenance(containerClient, key, timestamp, record, attachments);
        records.push(uploaded);
    }
    return records;
}


const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"] ?? "devstoreaccount1";
const accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"] ?? "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
const baseUrl = accountName === "devstoreaccount1"
    ? `http://127.0.0.1:10000/devstoreaccount1`
    : `https://${accountName}.blob.core.windows.net`;

const cred = new StorageSharedKeyCredential(accountName, accountKey);
const containerClient = new ContainerClient(`${baseUrl}/gosqas`, cred);

async function getProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`getProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    const provExists = await pathExists(containerClient, `prov/${deviceID}`);
    if (!provExists) {
        await convertLegacyProvenance(containerClient, deviceKey);
    }

    const records = new Array<ProvenanceRecord & { deviceID: string, timestamp: number }>();
    for await (const blob of containerClient.listBlobsFlat({ prefix: `prov/${deviceID}` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const { data, timestamp } = await decryptBlob(blobClient, deviceKey);
        const json = new TextDecoder().decode(data);
        const provRecord = JSON.parse(json) as ProvenanceRecord;
        records.push({ ...provRecord, deviceID, timestamp });
    }
    records.sort((a, b) => b.timestamp - a.timestamp)
    return { jsonBody: records };
}

async function getDecryptedBlob(request: HttpRequest, context: InvocationContext): Promise<DecryptedBlob | undefined> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    const attachmentID = request.params.attachmentID;
    context.log(`getDecryptedBlob`, { accountName, deviceKey: request.params.deviceKey, deviceID, attachmentID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return undefined; }

    const blobClient = containerClient.getBlockBlobClient(`attach/${attachmentID}`);
    const exists = await blobClient.exists();
    if (!exists) { return undefined; }

    return await decryptBlob(blobClient, deviceKey);
}

async function getAttachment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const decryptedBlob = await getDecryptedBlob(request, context);
    if (!decryptedBlob) { return { status: 404 } }

    const { data, contentType, filename } = decryptedBlob;
    const headers = new Headers();
    headers.append("Access-Control-Allow-Headers", "Attachment-Name");
    if (contentType) { headers.append("Content-Type", contentType); }
    if (filename) {
        headers.append("Content-Disposition", `attachment; filename="${filename}"`);
        headers.append("Attachment-Name", filename);
    }

    return { body: data, headers };
};

async function getAttachmentName(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const decryptedBlob = await getDecryptedBlob(request, context);
    if (!decryptedBlob) { return { status: 404 } }

    const { filename } = decryptedBlob;
    return { body: filename };
};

export async function postProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`postProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    await containerClient.createIfNotExists();

    const formData = await request.formData();
    const provenanceRecord = formData.get("provenanceRecord");
    if (typeof provenanceRecord !== 'string') { return { status: 404 }; }
    const record = JSON5.parse(provenanceRecord);

    // https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript#comment73511758_9756120
    const timestamp = new Date().getTime();
    const attachments = new Array<NamedBlob>();
    for (const attach of formData.values()) {
        if (typeof attach === 'string') continue;
        attachments.push({ blob: attach, name: attach.name });
    }

    const body = await uploadProvenance(containerClient, deviceKey, timestamp, record, attachments);
    return { jsonBody: body ?? { converted: true}};
}

async function upgradeProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const body = await convertLegacyProvenance(containerClient, deviceKey);
    return { jsonBody: body ?? { "already-converted": true} };
}

// blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
// where the id is that last part (before the last slash)
function findDeviceIdFromName(blobName: string): string {
    return blobName.split("/", 4)[1];
}

async function getStatistics(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    // Build up a JSON return value
    // NOTE: We seem to have to read the properties of the blob to get the
    // metadata.  There is a field called "metadata" on the blob itself
    // which does not contain our metadata. I don't know if this is terribly
    // expensive, or if we could improve it. I insist we should not worry about
    // performance until we measure it to be a problem, but this is an "orang flag"--
    // some caution around this issue is warranted.
    var records = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const props = await blobClient.getProperties();
        const metadata = props.metadata;
        // now we want to build up an object that we can return as statistics
        // that inlcudes the id and the timestamp, though really the timestamp
        // is enough. We would like to distinguish the additon of a device
        // from the addition of new provenance, I supoose.
        const id = findDeviceIdFromName(blob.name);
        // We could do some sorting in this function, but that is more or less
        // easily done by whomever is using this. So I think it better to just
        // return the data in  a fairly raw form, as an array of {timestamp, id} tuples.
        // Eventually, this function may have to only look back X days or X hours,
        // but until it gets unwieldy we can return everything.
        // I think the proper way to test this is to build a test program that
        // puts 1000s of objects into the database and see where performance becomes a problem.
        records.push({ timestamp: metadata.gdttimestamp, deviceID: id });
    }

    const contentType = "application/json";

    return {
        jsonBody: records,
        headers: { "Content-Type": contentType }
    };
};

app.get("getProvenance", {
    authLevel: 'anonymous',
    route: 'provenance/{deviceKey}',
    handler: getProvenance,
})

app.post("postProvenance", {
    authLevel: 'anonymous',
    route: 'provenance/{deviceKey}',
    handler: postProvenance
})

app.get("upgradeProvenance", {
    authLevel: 'anonymous',
    route: 'upgrade/{deviceKey}',
    handler: upgradeProvenance
})

app.get("getAttachment", {
    authLevel: 'anonymous',
    route: 'attachment/{deviceKey}/{attachmentID}',
    handler: getAttachment,
})

app.get("getAttachmentName", {
    authLevel: 'anonymous',
    route: 'attachment/{deviceKey}/{attachmentID}/name',
    handler: getAttachmentName,
})

app.get("getStatistics", {
    authLevel: 'anonymous',
    route: 'statistics',
    handler: getStatistics
})





