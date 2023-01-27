import * as fs from 'node:fs';
import { open } from 'node:fs/promises';

let stuff = [];
let nextUrl = 'https://api.zynx.com/t/zynx.com/connect/1.0.0/PlanDefinition/';
let fileDescriptor = null;


function findNextLink(json)
{
    return json.link.filter(x => x && x.relation && x.relation === 'next' && x.url)
}


function planDefPredicate(resource) {
    return resource.type.coding.filter(x => x.code === 'clinical-protocol').length > 0;
}

async function getStuff(url) {
    return await fetch(url, {
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 57b438ee-91bc-366f-92b4-7e581e89aea6',
        }
    }).
    then((response) => response.json()).
    then(json => {
        const nextLink = findNextLink(json);
        nextUrl = nextLink[0].url
        return json;
    }).
    then((data) => data.entry.filter(x => planDefPredicate(x.resource))).
    then(entries => {
        stuff.push(entries)
        return entries.length;
    });
}

async function doMyThing(url) {
    let plansFound = 0
    let nCopies = 0
    do {        
        plansFound = await getStuff(url);
        console.log(`plans found: ${plansFound}, stuff.length: ${stuff.length}`)
        console.log(`nextUrl: ${nextUrl}`)
    } while (nextUrl != '' && ++nCopies < 4)
    console.log(`ending stuff.length: ${stuff.length}`)
    const foo = {
        planDefs : stuff
    }
    fileDescriptor = await open('./zynx-data-0.json', 'a+')
    fileDescriptor.appendFile(JSON.stringify(foo))
    fileDescriptor.close()
}


doMyThing(nextUrl);

