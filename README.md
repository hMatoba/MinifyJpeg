JavaScript-MinifyJpeg
=====================

To minify JPEG images without losing EXIF.


Depends on jpg.js
--------------------------------------------------------
   Copyright 2011 notmasteryet(https://github.com/notmasteryet/jpgjs)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

Demo
----
  Copy this project on desktop and open example.html

How to Use
----------
    <input type="file" id="files" name="files[]" multiple />
    <script source="/js/jpg.js" />
    <script source="/js/MinifyJpeg.js" />
    ******************************************
    function handleFileSelect(evt) {
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++){
            var reader = new FileReader();
            reader.onloadend = (function(theFile){
                return function(e){
                    var minified = MinifyJpeg.minify(e.target.result, 1280);

                    // add image to body
                    var img = new Image();
                    img.src = "data:image/jpeg;base64," + MinifyJpeg.encode64(minified);
                    $('body').append(img);
                }
            })(f);

            reader.readAsDataURL(f);
        }
    }