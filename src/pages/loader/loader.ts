import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
/**
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
*/

@IonicPage()
@Component({
  selector: 'page-loader',
  templateUrl: 'loader.html',
})
export class LoaderPage {

  /**
  constructor (private file: File,
               private platform: Platform,
               private transfer: FileTransfer) {
  }
  */

  async dlAFile () {

    /**
    console.log('platform is android', this.platform.is('android'));
    // const LocalFileSystemPERSISTENT = window.LocalFileSystem.PERSISTENT;
    const uri = '';
    const dir = 'ok';
    const fileName = 'my_picture.jpg';
    const fileDirName = dir + fileName;

    const fileTransfer: FileTransferObject = this.transfer.create();

    fileTransfer.download(fileDirName, uri)
      .then((data) => {
        // success
        console.log('ok');
      }, (err) => {
        // error
        console.log('no');
      })

     */

    /**
    this.file.resolveLocalFilesystemUrl('/ouioui.png').then((success: any) => {
      console.log('success', success);
    }, (error: any) => {
      console.log('error', error);
    });
    */

    /*
    window.requestFileSystem(LocalFileSystemPERSISTENT, 0, function (fs) {
      console.log('file system open: ' + fs.name);
      fs.root.getFile('bot.png', { create: true, exclusive: false }, function (fileEntry) {
        console.log('fileEntry is file? ' + fileEntry.isFile.toString());
        var oReq = new XMLHttpRequest();
        // Make sure you add the domain name to the Content-Security-Policy <meta> element.
        oReq.open("GET", uri, true);
        // Define how you want the XHR data to come back
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
          var blob = oReq.response; // Note: not oReq.responseText
          if (blob) {
            // Create a URL based on the blob, and set an <img> tag's src to it.
            var url = window.URL.createObjectURL(blob);
            document.getElementById('bot-img').src = url;
            // Or read the data with a FileReader
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
              // reader.result contains the contents of blob as text
            });
            reader.readAsText(blob);
          } else console.error('we didnt get an XHR response!');
        };
        oReq.send(null);
      }, function (err) { console.error('error getting file! ' + err); });
    }, function (err) { console.error('error getting persistent fs! ' + err); });
    */

  }
}
