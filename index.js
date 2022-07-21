const express = require("express")
// const { file } = require("googleapis/build/src/apis/file")
const path = require("path")
const uuid = require('uuid')
const fs = require('fs')
const { Readable } = require('stream');
// const os = require('os')
const fileUpload = require("express-fileupload");

const {google} = require('googleapis');
const auth = require('./auth')
const service = google.drive({version: 'v3', auth})

const app = express()



const  deleteMethod = async (request,response)=> {
  const fileId = request.query.fileId;
  let  trashed = false;
  if(request.query.trashed){
    trashed = request.query.trashed;
  }
  try {
    const res = await service.files.update({
      fileId, requestBody: {trashed: trashed}
    });
    response.send(res.data)
  } catch (err) {
    response.send('Failed to find file by id:  '+fileId)
  }
}


const  allImages = async (request,response)=> {
  let  trashed = false;
  if(request.query.trashed){
    trashed = request.query.trashed;
  }
  const files = [];
  try {
    const res = await service.files.list({
      q: 'mimeType=\'image/jpeg\' and trashed='+trashed+' ',
      fields: 'nextPageToken, files(id, name,mimeType, kind)',
      spaces: 'drive',
    });
    Array.prototype.push.apply(files, res.files);
    response.send(res.data.files)
  } catch (err) {
    response.send('Failed to find')
  }
}

const getAllfolders = async (request,response)=> {
  let  trashed = false;
  if(request.query.trashed){
    trashed = request.query.trashed;
  }
  try {
    const res = await service.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=  "+trashed+" ",
      spaces: 'drive',
    });
    response.send(res.data.files)
  } catch (err) {
    response.send('Failed to find')
  }
}

const  searchByName = async (request,response)=> {
  let  trashed = false
  let fileName = ''
  if(request.query.trashed){ trashed = request.query.trashed;}
  if(request.query.fileName){ fileName = request.query.fileName;}
  try {
    const res = await service.files.list({
      q: 'name=\''+fileName+'\' and trashed='+trashed+' ',
      fields: 'nextPageToken, files(id, name, mimeType, kind)',
      spaces: 'drive',
    });
    response.send(res.data.files)
  } catch (err) {
    response.send('Failed to find')
  }
}
const  searchByID = async (request,response)=> {
  let fileId = ''
  if(request.query.trashed){ trashed = request.query.trashed}
  if(request.query.fileId){ fileId = request.query.fileId}
  try {
    const res = await service.files.get({
      fileId  //Do not supply a request body with this method.
    });
    response.send(res.data)
  } catch (err) {
    response.send('Failed to find')
  }
}

const  downloadImage =  (request,response)=> {
  let fileId = ''
  if(request.query.fileId){ fileId = request.query.fileId}

  service.files.get({fileId, alt: 'media'}, {responseType: 'stream'})
    .then( res => {
      new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, uuid.v4()+'.png');
        console.log(`writing to ${filePath}`);
        const dest = fs.createWriteStream(filePath);
        let progress = 0;
        res.data
          .on('end', () => {
            console.log('Done downloading file.');
            resolve(filePath);
          })
          .on('error', err => {
            console.error('Error downloading file.');
            reject(err);
            
          })
          .on('data', d => {
            progress += d.length;
            if (process.stdout.isTTY) {
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`Downloaded ${progress} bytes`);
            }
          })
          .pipe(dest);
      });

      response.send('File Downloaded Successfully in')
    })
    .catch(err => response.send('Failed to download'))

}

const  details = async (request,response)=> {
  let fileId = ''
  if(request.query.fileId){ fileId = request.query.fileId}
  try {
    const res = await service.files.get({
      fileId, fields: '*'  //Do not supply a request body with this method.
    });
    response.send(res.data)
  } catch (err) {
    response.send('Failed to find')
  }
}

const  upload = async (request, response) => {
  if (!request.files) {
    response.send("File was not found");
    return;
  }
  const file = request.files.file;
  const stream = Readable.from(file.data);
     folderId = '1IDyTgGy4Lajl3eZEV55PHHOZ6q034tgU';
      const fileMetadata = {
          name: uuid.v4()+'sample',
          parents:[folderId]
   };
    const media = {
    mimeType: file.mimeType,
    body: stream,
  }
  try {
    const res = await service.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });
    response.send(res.data)
  } catch (err) {
    response.send('Failed to upload')
  }

}

app.listen(3000,function(error) {
  if(error) throw error
      console.log("Server created Successfully on PORT 3000")
})

app.get('/search-by-name',searchByName);
app.get('/search-by-id',searchByID);
app.get('/images',allImages);
app.get('/folders',getAllfolders);
app.get('/download-image',downloadImage);
app.get('/details',details);
app.delete('/delete',deleteMethod);

app.use(fileUpload({ 
   limits: { fileSize: 1 * 1024 * 1024 }, //1MB max file(s) size
 }))

app.post('/upload', upload);