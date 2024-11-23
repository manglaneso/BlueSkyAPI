# BlueSkyAPI

BlueSky API integration for Google Apps Script

### DISCLAIMER

This is a very early version of the library with a little number of the methods listed in the [AT Protocol XRPC API](https://docs.bsky.app/docs/api/at-protocol-xrpc-api) implemented. Contributions are appreciated!


### Inspiration

Inspiration for this comes from Bradley Momberger's [Twitterlib](https://github.com/airhadoken/twitter-lib) which unfortunately stopped working since Twitter (or X I guess) decided to shut down the v1 Twitter API for non-Enterprise developers, and since I wanter to give Mastodon a try, I wanted some Twitter bots I implemented to live on somewhere else.

### Use

Click the + after Libraries, paste in 1CZLW7OUPIgrr0oblfsNQ5ir-k1sF8jVryUeRj4fb1WoOom-OTSciVq96 (the project key for this script), and add in BlueSkyAPI and select its latest version.

Create a BlueSky app password in your BlueSky PDS and create a BlueSkyAPI object passing the URL and video service URL of your PDS, your BlueSky handle and your app password.

```javascript
let bluesky = BlueSkyAPI.init(serviceUrl, accessToken, identifier, password);
```

After that, with the created BlueSkyAPI object you can start using the different methods:

```javascript

// Upload a video
let uploadMediaInit = bluesky.uploadVideo(videoBlob);
// Get the status of the media upload
let getMedia = bluesky.getJobStatus(jobId, exp);
// Publish a record with the uploaded video attached
let record = bluesky.createVideoRecord("", blobLink, mimeType, altMessage, length, width, height, ["en"]);
// Publish a record with an uploaded image attached
let record = bluesky.createImageRecord(text, imageLink, mimeType, alt, size);
// Publish a text record
let record =  bluesky.createRecord(text, langs);
// Upload a blob
let upload = bluesky.uploadBlob(blob);
// List all your records
let upload = bluesky.listRecords();
// Delete a record
let deletedRecord = bluesky.deleteRecord(collection, rkey);
```

### Example of use

You can find an example of use in the [following repo](https://github.com/manglaneso/oraleputosbot/blob/main/src/BlueSkyTriggerService.js).