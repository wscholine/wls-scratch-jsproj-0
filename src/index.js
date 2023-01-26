import * as fs from 'node:fs';
import { open } from 'node:fs/promises';

console.log('Hello world')

let stuff = [];
let nextUrl = 'https://api.zynx.com/t/zynx.com/connect/1.0.0/PlanDefinition/';
let fileDescriptor = null;

async function getStuff(url) {
    await fetch(url, {
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 57b438ee-91bc-366f-92b4-7e581e89aea6',
        }
    }).
    then((response) => {
        
        return response.json();
    }).
    then(json => {
        nextUrl = json.link[1] ? json.link[1].url : '';
        console.log(`in fetch: nextUrl: ${nextUrl}`)
        return json;
    }).
    then((data) => data.entry.filter(x => x.resource.type.coding[0].code === 'clinical-protocol')).
    then(entries => {
        console.log(entries)
        fileDescriptor.appendFile(JSON.stringify(entries[0]))
        fileDescriptor.appendFile(',')
        stuff.push(entries)
        console.log(`entries.length: ${entries.length}`)
        return entries.length;
    });
}

async function doMyThing(url) {
    let plansFound = 0
    fileDescriptor = await open('./zynx-data-0', 'a+')
    do {        
        plansFound = await getStuff(url);
        console.log(`plans found: ${plansFound}, stuff.length: ${stuff.length}`)
        console.log(`nextUrl: ${nextUrl}`)
    } while (nextUrl != '')
    fileDescriptor.close()
}


doMyThing(nextUrl);

console.log(`stuff.length: ${stuff.length}`)