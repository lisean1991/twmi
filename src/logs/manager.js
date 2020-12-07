import fs from 'fs';

export const writeMessage = (fileName, message) => {
    let pwd = process.cwd();
    console.log(message);
    fs.appendFileSync(pwd+'\\log\\' + fileName, message+"\n", (err) => {
        console.log(err)
    });
}

export const writeAccMessage = (fileName, message) => {
    let pwd = process.cwd();
    console.log(message);
    fs.appendFileSync(pwd+'\\acclog\\' + fileName, message+"\n", (err) => {
        console.log(err)
    });
}