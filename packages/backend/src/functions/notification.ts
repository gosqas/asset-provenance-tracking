import { sendEmail } from "./sendEmail.js";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getProvenance, postProvenance } from './httpTrigger.js';


export interface Notification {
    toAddress: string;
    toName: string;
    subject: string;
    body: string;
}


export async function sendNotification(notification: Notification): Promise<void> {
    // TODO: add rate limiting, queueing, other notification channels and other notification logic

    try {
        const from_address = process.env['FROM_ADDRESS'];
        if (!from_address) {
            throw new Error('FROM_ADDRESS is not defined');
        }
        await sendEmail(from_address, notification.toAddress, notification.subject, notification.body, notification.toName);
    } catch (error) {
        console.error("Failed to send notification", error);
    }
}


async function streamToObject(body) {
    if (!body) {
        throw new Error('Body is null or undefined');
    }

    // If body is already an object
    if (typeof body === 'object') {
        return body;
    }

    // If body is already a string or buffer
    if (typeof body === 'string') {
        return JSON.parse(body);
    }

    // If body is a buffer
    if (Buffer.isBuffer(body)) {
        return JSON.parse(body.toString());
    }

    // If body has text() method (like Response object)
    if (typeof body.text === 'function') {
        const text = await body.text();
        return JSON.parse(text);
    }

    // If body has json() method (like Response object)
    if (typeof body.json === 'function') {
        return body.json();
    }

    // If body is a ReadableStream
    if (body.getReader && typeof body.getReader === 'function') {
        const reader = body.getReader();
        let result = '';
        
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }
        
        return JSON.parse(result);
    }

    throw new Error('Unsupported body type');
}


// export async function subscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
//     // This should be called from the frontend or another function like postProvenance

//     console.log("subscribeNotification", JSON.stringify(request));
//     try {
//         const obj = await streamToObject(request.body);
//         console.log("body:", obj);

//         // TODO: Email will be encrypted in the future, so this could just be a hash

//         // Validate email
//         if (!obj.email) {
//             throw new Error('Email is required');
//         }

//         // Add email to the provenance record
//         const getProv = {
//             params: request.params
//         } as unknown as HttpRequest;
//         const response = await getProvenance(getProv, context);
//         console.log("get provenance", JSON.stringify(response));

//         // Subscription logic
//         let j = response.jsonBody;
//         if (!j.subscribers) {
//             j.subscribers = [];
//         }
//         j.subscribers.push(obj.email);
//         console.log("j:", j);

//         const postProv = {
//             params: request.params,
//             jsonBody: j,
//         } as unknown as HttpRequest;

//         // Update the provenance record
//         console.log("post provenance", JSON.stringify(postProv));
//         await postProvenance(postProv, context);
//     } catch (error) {
//         console.error(error);
//         return {
//             status: 400, // Bad request
//             body: "Error subscribing"
//         };
//     }

//     return {
//         status: 200,
//         body: "Subscribed successfully"
//     };
// }

// export async function unsubscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
//     console.log("unsubscribeNotification", JSON.stringify(request));

//     try {
//         const obj = await streamToObject(request.body);
//         console.log("body:", obj);

//         // TODO: Email will be encrypted in the future, so this could just be a hash

//         // Validate email
//         if (!obj.email) {
//             throw new Error('Email is required');
//         }

//         // Add email to the provenance record
//         const getProv = {
//             params: request.params
//         } as unknown as HttpRequest;
//         const response = await getProvenance(getProv, context);
//         console.log("get provenance", JSON.stringify(response));

//         // Subscription logic
//         let j = response.jsonBody;
//         if (j.subscribers) {
//             // Remove email from the subscribers list
//             j.subscribers = j.subscribers.filter(subscriber => subscriber !== obj.email);
//         }
//         console.log("j:", j);

//         const postProv = {
//             params: request.params,
//             jsonBody: j,
//         } as unknown as HttpRequest;

//         // Update the provenance record
//         console.log("post provenance", JSON.stringify(postProv));
//         await postProvenance(postProv, context);
//     } catch (error) {
//         console.error(error);
//         return {
//             status: 400, // Bad request
//             body: "Error subscribing"
//         };
//     }

//     return {
//         status: 200,
//         body: "Unsubscribed successfully"
//     };
// }


export async function processNotification(data: any): Promise<void> {
    console.log("processNotification", JSON.stringify(data));
}

// export async function notifySubscribers(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
export async function notifySubscribers(records: any): Promise<HttpResponseInit> {
    // When a provenance record is updated, this function will process the subscriptions and send notifications
    
    // Ideally only the subscription object should be needed, so the notification system can be decoupled from the 
    // provenance system prove that it works without provenance data

    // console.log("notifySubscribers", JSON.stringify(request));

    // TODO: // This could take a long time! Add rate limiting, queueing etc.

    try {
        // const obj = await streamToObject(request.body);
        // console.log("body:", obj);

        // // Validate email
        // if (!obj.subscribers) {
        //     throw new Error('Subscribers are required');
        // }

        // Send email to each subscriber
        // for (const subscriber of obj.subscribers) {
        //     console.log("Sending notification to", subscriber);
        //     const notification = {
        //         toAddress: subscriber,
        //         toName: "Notification",
        //         subject: "Notification",
        //         body: "Notification body"
        //     };
            
        //     await sendNotification(notification);
        // }

    } catch (error) {
        console.log(error);
        return {
            status: 400,
            body: "Error notifying subscribers",
        };
    }
    return {
        status: 200,
        body: "Notified successfully"
    };
}


// app.get("subscribeNotification", {
//     authLevel: 'anonymous',
//     route: 'notification/subscribe',
//     handler: subscribeNotification
// })

// app.post("unsubscribeNotification", {
//     authLevel: 'anonymous',
//     route: 'notification/unsubscribe',
//     handler: unsubscribeNotification
// })
