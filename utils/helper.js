const{S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


const s3Client = new S3Client({
    region:"ap-south-1",
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY,
        secretAccessKey:process.env.AWS_SECRET_KEY
    }
})

async function getObjectUrl(key){
    const command = new GetObjectCommand({
        Bucket:"vodinputsrc",
        Key:key
    });

    const url = getSignedUrl(s3Client,command,{expiresIn:3600})

    console.log(`The url is ${url}`);
    return url
}

async function putObject(filename,contentType){

    const command = new PutObjectCommand({
        Bucket:"vodinputsrc",
        Key:`inputs/${filename}`,
        ContentType:contentType
    });

    const url = getSignedUrl(s3Client,command);

    return url;

}



module.exports = {getObjectUrl,putObject}






