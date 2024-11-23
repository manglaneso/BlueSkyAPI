class BlueSkyAPI {
  constructor(serviceUrl, videoUrl, identifier, password) { // class constructor
    this.serviceUrl = serviceUrl;
    this.videoUrl = videoUrl;
    this.identifier = identifier;
    this.password = password;
    this.session = this.createSession();
  }

  createSession() {
    let url = `${this.serviceUrl}/xrpc/com.atproto.server.createSession`;

    var result;

    let postData = {
      "identifier": this.identifier,
      "password": this.password
    };

    let options = {
      'method': 'POST',
      'contentType': 'application/json',
      'payload': JSON.stringify(postData)
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Session creation success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Session creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  refreshSession() {
    let url = `${this.serviceUrl}/xrpc/com.atproto.server.refreshSession`;

    var result;

    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${this.session.refreshJwt}`
      },
      'contentType': 'application/json',
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Session refresh success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Session refresh failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  getSession() {
    let url = `${this.serviceUrl}/xrpc/com.atproto.server.getSession?handle=${this.identifier}&did=${this.session.did}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Get Session success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Get session failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  getServiceAuth(exp, lxm) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.server.getServiceAuth?aud=${this.getAudFromSession_()}&exp=${exp}&lxm=${lxm}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Service auth creation success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Service auth creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  uploadVideo(videoBlob, exp) {
    this.refreshSessionIfNeeded_();
    let serviceAuth = this.getServiceAuth(exp, "com.atproto.repo.uploadBlob");

    let url = `${this.videoUrl}/xrpc/app.bsky.video.uploadVideo?did=${this.session.did}&name=${videoBlob.getName()}`;

    var result;

    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${serviceAuth.token}`
      },
      'muteHttpExceptions' : true,
      'contentType': 'video/mp4',
      'payload': videoBlob
    };

      result = UrlFetchApp.fetch(url, options);
      if ((result.getResponseCode() >= 200 && result.getResponseCode() < 300) || result.getResponseCode() == 409) {
        Logger.log("Video upload success. Response code was: " + result.getResponseCode() + "\n\n Result was:" + JSON.stringify(JSON.parse(result)));
        return JSON.parse(result);
      } else {
        Logger.log("Video upload failed. Error was:\n" + JSON.stringify(result.getContentText()) + "\n\noptions were:\n" + JSON.stringify(options) + "\n\n");
        return null;
      }
  }

  getJobStatus(jobId, exp) {
    this.refreshSessionIfNeeded_();
    let serviceAuth = this.getServiceAuth(exp, "com.atproto.repo.uploadBlob");

    let url = `${this.videoUrl}/xrpc/app.bsky.video.getJobStatus?jobId=${jobId}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${serviceAuth.token}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("GetJobStatus success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("GetJobStatus failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  getUploadLimits(exp) {
    this.refreshSessionIfNeeded_();
    let serviceAuth = this.getServiceAuth(exp, "com.atproto.repo.uploadBlob");

    let url = `${this.videoUrl}/xrpc/app.bsky.video.getUploadLimits`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${serviceAuth.token}`
      },
      'muteHttpExceptions' : true
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("GetUploadLimit success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("GetUploadLimit failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  createRecord(text, langs) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.createRecord`;

    var result;
  
    let postData = {
      "collection": "app.bsky.feed.post",
      "repo": this.session.did,
      "record": {
        "text": text,
        "$type": "app.bsky.feed.post",
        "langs": langs,
        "createdAt": new Date().toISOString()
      }
    };
    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      },
      'contentType': 'application/json',
      'payload': JSON.stringify(postData)
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Record creation success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Record creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  createImageRecord(text, imageLink, mimeType, alt, size) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.createRecord`;

    var result;

    let postData = {
      "collection": "app.bsky.feed.post",
      "repo": did,
      "record": {
        "text": text,
        "createdAt": new Date().toISOString(),
        "$type": "app.bsky.feed.post",
        "embed": {
          "$type": "app.bsky.embed.images",
          "images": [
            {
              "alt": alt,
              "image": {
                "$type": "blob",
                "mimeType": mimeType,
                "ref": {
                  "$link": imageLink
                },
                "size": size
              }
            }
          ]
        }
      }
    };

    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      },
      'contentType': 'application/json',
      'payload': JSON.stringify(postData)
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Record creation success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Record creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  createVideoRecord(text, videoLink, mimeType, alt, size, width, height, langs) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.createRecord`;

    var result;

    let postData = {
      "collection": "app.bsky.feed.post",
      "repo": this.session.did,
      "record": {
        "text": text,
        "$type": "app.bsky.feed.post",
        "embed": {
          "$type": "app.bsky.embed.video",
          "video": {
            "$type": "blob",
            "ref": {
              "$link": videoLink
            },
            "mimeType": mimeType,
            "size": size
          },
          "alt": alt,
          "aspectRatio": {
            "width": width,
            "height": height          
          },
        },
        "langs": langs,
        "createdAt": new Date().toISOString()
      }
    };
    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      },
      'contentType': 'application/json',
      'payload': JSON.stringify(postData)
    };

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Record creation success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Record creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  listRecords() {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.listRecords?repo=${this.session.did}&collection=app.bsky.feed.post`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("List records success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);s
      Logger.log("List records creation failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  deleteRecord(collection, rkey) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.deleteRecord`;

    var result;

    let postData = {
      "repo": this.session.did,
      "collection": collection,
      "rkey": rkey
    };

    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`,
      },
      'contentType': 'application/json',
      'payload': JSON.stringify(postData)
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Record deletion success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Recorddeletion failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  listRepos() {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.sync.listRepos`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`,
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("List repos success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("List repos failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  getRepo() {
    this.refreshSession()
    let url = `${this.serviceUrl}/xrpc/com.atproto.sync.getRepo?did=${this.session.did}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`,
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("List repos success. Response code was: " + result.getResponseCode() + "\n\n");
      return result;
    } catch (e) {
      Logger.log(e);
      Logger.log("List repos failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  describeRepo() {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.describeRepo?repo=${this.session.did}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`,
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Describe repo success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Describe repo failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  listBlobs() {
    this.refreshSessionIfNeeded_()
    let url = `${this.serviceUrl}/xrpc/com.atproto.sync.listBlobs?did=${this.session.did}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Blobs listing success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Blobs listing failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  getBlob(cid) {
    this.refreshSessionIfNeeded_()
    let url = `${serviceUrl}/xrpc/com.atproto.sync.getBlob?did=${this.session.did}&cid=${cid}`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Blob get success. Response code was: " + result.getResponseCode() + "\n\n");
      return result;
    } catch (e) {
      Logger.log(e);
      Logger.log("Blob get failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  uploadBlob(blob) {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.uploadBlob`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      },
      'payload': blob
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Upload blob success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Upload blob failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  listMissingBlobs() {
    this.refreshSessionIfNeeded_();
    let url = `${this.serviceUrl}/xrpc/com.atproto.repo.listMissingBlobs`;

    var result;

    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Bearer ${this.session.accessJwt}`
      }
    }

    try {
      result = UrlFetchApp.fetch(url, options);
      Logger.log("Missing Blobs listing success. Response code was: " + result.getResponseCode() + "\n\n");
      return JSON.parse(result);
    } catch (e) {
      Logger.log(e);
      Logger.log("Missing Blobs listing failed. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + ((typeof result !== 'undefined')?"\n\result was:\n" + result:"") + "\n\n");
      return null;
    }
  }

  refreshSessionIfNeeded_() {
    let currentSession = this.getSession();
    if (!currentSession.active) {
      Logger.log("Session expired. Refreshing session.")
      this.session = this.refreshSession();
    }
  }

  getAudFromSession_() {
    let serviceEndpoint = this.session.didDoc.service[0].serviceEndpoint;
    let service = serviceEndpoint.split("//");
    return `did:web:${service[1]}`;
  }
}

function init(serviceUrl, videoUrl, identifier, password) {
  return new BlueSkyAPI(serviceUrl, videoUrl, identifier, password);
}
