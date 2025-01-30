import { postProvenance } from "~/services/azureFuncs";

export async function subscribeNotification(recordKey: string, email: string, tags: string[]) {
    const response = await postProvenance(recordKey, {
        blobType: 'deviceRecord',
        description:  `Subscribed to notifications ${email}, ${tags}`,
        email: email,
        tags: tags,
    }, []);
    
    console.log("Updated records: ", response);
}

export async function unsubscribeNotification(recordKey: string, email: string, tags: string[]) {
    const response = await postProvenance(recordKey, {
        blobType: 'deviceRecord',
        description:  `Unsubscribed to notifications ${email}, ${tags}`,
        email: email,
        tags: tags,
    }, []);
    
    console.log("Updated records: ", response);
}
