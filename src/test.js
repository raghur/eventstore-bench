import http from 'k6/http';
import {check} from 'k6'
import {options, urlbase} from "./config.js"
import uuid from './vendor/uuid.js'

export default function() {
    // console.log(options)
    // console.log(urlbase)
    // console.log(uuid.v1())
    // console.log(uuid.v4())

    let streamId = uuid.v1()

    // push 10 events one by one
    for (let i=0; i < options.eventCount; i++) {
        let eventId = uuid.v1()
        let event = [
            {
                "eventId": eventId,
                "eventType": "event-type",
                "data": { "a": "1" }
            }
        ]
        const postEventResp = http.post(`${urlbase}/streams/${streamId}`, JSON.stringify(event),  {
            headers: {
                "Content-type": "application/vnd.eventstore.events+json"
            }
        });
        check(postEventResp, {
            "is status 201": (r) => r.status == 201
        });
    }

    // get the entire stream
    const getStreamResponse = http.get(`${urlbase}/streams/${streamId}`, {
        headers: {
            "Accept": "application/vnd.eventstore.atom+json"
        }
    });
    check(getStreamResponse, {
        "is status 200": (r) => r.status == 200
    })

    // get each event by id
    for (let i=0; i < options.eventCount; i++) {
        const getEventResp = http.get(`${urlbase}/streams/${streamId}/${i}`,  {
            headers: {
                "Accept": "application/vnd.eventstore.atom+json"
            }
        });
        check(getEventResp, {
            "is status 200": (r) => r.status == 200
        });
    }
};
