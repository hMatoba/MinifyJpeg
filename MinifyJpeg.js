/* Minify a jpeg image without loosing EXIF
 * TESTED(24/01/2013): FireFox, GoogleChrome, IE10, Opera
 * depend on jpg.js
 *
 * To minify jpeg image:
 *     minified = MinifyJpeg.minify(image, length);
 *     xhr.send(minified.buffer);
 *     enc = "data:image/jpeg;base64," + MinifyJpeg.encode64(minified);
 *     html = '<img src="' + enc + '">';
 * MinifyJpeg.minify() - return Uint8Array
 * image - image base64encoded, it can be obtained "FileReader().readAsDataURL(f)"
 * length - the long side length of the rectangle
 * MinifyJpeg.encode64() - convert array to base64encoded string
 */

var MinifyJpeg = (function()
{
    var MinifyJpeg = {};

    MinifyJpeg.KEY_STR = "ABCDEFGHIJKLMNOP" +
                         "QRSTUVWXYZabcdef" +
                         "ghijklmnopqrstuv" +
                         "wxyz0123456789+/" +
                         "=";

    MinifyJpeg.SOF = [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207];

    MinifyJpeg.minify = function(imageStr, chouhen)
    {
        if (!imageStr.match("data:image/jpeg;base64,")){throw "MinifyJpeg.minify got a not JPEG data";}
        var startTime = new Date();
        var NEW_SIZE = parseInt(chouhen);
        var rawImage = this.decode64(imageStr.replace("data:image/jpeg;base64,", ""));
        var segments = this.slice2Segments(rawImage);
        var resized = this.resizeImage(imageStr, rawImage, segments, NEW_SIZE);

        if (resized)
        {
            var image = this.exifManipulation(resized, segments);
        }
        else
        {
            var image = new Uint8Array(rawImage);
        }
        var time = ((new Date()) - startTime) / 1000;
        console.log(time + "[s]")
        return image;
    }

    MinifyJpeg.getImageSize = function(imageArray)
    {
        var segments = this.slice2Segments(imageArray);
        return this.imageSizeFromSegments(segments);
    }

    MinifyJpeg.slice2Segments = function(rawImageArray)
    {
        var head = 0,
            segments = [];

        while (1)
        {
            if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 218){break;}
            if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 216)
            {
                head += 2;
            }
            else
            {
                var length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3],
                    endPoint = head + length + 2,
                    seg = rawImageArray.slice(head, endPoint);
                segments.push(seg);
                head = endPoint;
            }
            if (head > rawImageArray.length){break;}
        }

        return segments;
    }

    MinifyJpeg.imageSizeFromSegments = function(segments)
    {
        for  (var x=0; x<segments.length; x++)
        {
            var seg = segments[x];
            if (this.SOF.indexOf(seg[1]) >= 0)
            {
                var height = seg[5] * 256 + seg[6],
                    width = seg[7] * 256 + seg[8];
                break;
            }
        }
        return [width, height];
    }

    MinifyJpeg.encode64 = function(input)
    {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0;

        do {
            chr1 = input[i++];
            chr2 = input[i++];
            chr3 = input[i++];

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
               enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
               enc4 = 64;
            }

            output = output +
               this.KEY_STR.charAt(enc1) +
               this.KEY_STR.charAt(enc2) +
               this.KEY_STR.charAt(enc3) +
               this.KEY_STR.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    }

    MinifyJpeg.decode64 = function(input) {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0,
            buf = [];

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            alert("There were invalid base64 characters in the input text.\n" +
                  "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                  "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.KEY_STR.indexOf(input.charAt(i++));
            enc2 = this.KEY_STR.indexOf(input.charAt(i++));
            enc3 = this.KEY_STR.indexOf(input.charAt(i++));
            enc4 = this.KEY_STR.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            buf.push(chr1);

            if (enc3 != 64) {
               buf.push(chr2);
            }
            if (enc4 != 64) {
               buf.push(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return buf;
    }

    MinifyJpeg.resizeImage = function(imageStr, rawImage, segments, NEW_SIZE)
    {
        var size = this.imageSizeFromSegments(segments),
            width = size[0],
            height = size[1],
            chouhen = (width>=height) ? width : height,
            newSize = NEW_SIZE,
            resizing = 1;

        if (chouhen < newSize)
        {
            return false;
        }
        else{
            var scale = parseFloat(newSize)/chouhen;
            var newWidth = parseInt(parseFloat(newSize)/chouhen * width);
            var newHeight = parseInt(parseFloat(newSize)/chouhen * height);
        }

        if (resizing == 1) // bilinear
        {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            var jpe = new JpegImage(),
                ctx = canvas.getContext("2d"),
                srcImg = ctx.getImageData(0, 0, width, height);
            jpe.parse(new Uint8Array(rawImage));
            jpe.copyToImageData(srcImg);

            var newCanvas = document.createElement('canvas');
        	newCanvas.width = newWidth;
        	newCanvas.height = newHeight;
            var newCtx = newCanvas.getContext("2d");
        	var destImg = newCtx.createImageData(newWidth, newHeight);
        	this.bilinear(srcImg, destImg, scale);

        	newCtx.putImageData(destImg, 0, 0);
            var resizedImage = newCanvas.toDataURL("image/jpeg");
        }
        else // nearest neighbor?
        {
            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;

            var jpe = new JpegImage();
                ctx = canvas.getContext("2d");
                d = ctx.getImageData(0, 0, newWidth, newHeight);
            jpe.parse(new Uint8Array(rawImage));
            jpe.copyToImageData(d);
            ctx.putImageData(d, 0, 0);

            var resizedImage = canvas.toDataURL("image/jpeg");
        }

        return resizedImage;
    }

    MinifyJpeg.getExifArray = function(segments)
    {
        var seg;
        for (var x=0; x<segments.length; x++)
        {
            seg = segments[x];
            if (seg[0] == 255 & seg[1] == 225) //(ff e1)
            {
                return seg;
            }
        }
        return [];
    }

    MinifyJpeg.insertExif = function(imageStr, exifArray)
    {
        var imageData = imageStr.replace("data:image/jpeg;base64,", ""),
            buf = this.decode64(imageData),
            separatePoint = buf.indexOf(255,3),
            mae = buf.slice(0, separatePoint),
            ato = buf.slice(separatePoint),
            array = mae;

        array = array.concat(exifArray);
        array = array.concat(ato);
        return array
    }

    MinifyJpeg.exifManipulation = function(lostExifImageStr, segments)
    {
        var exifArray = this.getExifArray(segments),
            newImageArray = this.insertExif(lostExifImageStr, exifArray),
            aBuffer = new Uint8Array(newImageArray);

        return aBuffer;
    }


    // compute vector index from matrix one
    MinifyJpeg.ivect = function (ix, iy, w) {
    	// byte array, r,g,b,a
    	return((ix + w * iy) * 4);
    }

    MinifyJpeg.bilinear = function (srcImg, destImg, scale) {
    	// c.f.: wikipedia english article on bilinear interpolation
    	//log.debug("in bilinear");
    	// taking the unit square
    	function inner(f00, f10, f01, f11, x, y) {
    		var un_x = 1.0 - x; var un_y = 1.0 - y;
    		return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    	}
        var srcWidth = srcImg.width;
        var srcHeight = srcImg.height;
        var srcData = srcImg.data;
        var dstData = destImg.data;
    	var i, j;
    	var iyv, iy0, iy1, ixv, ix0, ix1;
    	var idxD, idxS00, idxS10, idxS01, idxS11;
    	var dx, dy;
    	var r, g, b, a;
    	for (i = 0; i < destImg.height; ++i) {
            iyv = (i + 0.5) / scale - 0.5;
    		iy0 = Math.floor(iyv);
    		iy1 = ( Math.ceil(iyv) > (srcHeight-1) ? (srcHeight-1) : Math.ceil(iyv) );
    		for (j = 0; j < destImg.width; ++j) {
                ixv = (j + 0.5) / scale - 0.5;
    			ix0 = Math.floor(ixv);
    			ix1 = ( Math.ceil(ixv) > (srcWidth-1) ? (srcWidth-1) : Math.ceil(ixv) );
    			idxD = this.ivect(j, i, destImg.width);
    			idxS00 = this.ivect(ix0, iy0, srcWidth);
    			idxS10 = this.ivect(ix1, iy0, srcWidth);
    			idxS01 = this.ivect(ix0, iy1, srcWidth);
    			idxS11 = this.ivect(ix1, iy1, srcWidth);
    			// log.debug(sprintf("bilinear: idx: D: %d, S00: %d, S10: %d, S01: %d, S11: %d", idxD, idxS00, idxS10, idxS01, idxS11));
    			dx = ixv - ix0; dy = iyv - iy0;

                //r
    			dstData[idxD] = inner(srcData[idxS00], srcData[idxS10],
    				srcData[idxS01], srcData[idxS11], dx, dy);

                //g
    			dstData[idxD+1] = inner(srcData[idxS00+1], srcData[idxS10+1],
    				srcData[idxS01+1], srcData[idxS11+1], dx, dy);

                //b
    			dstData[idxD+2] = inner(srcData[idxS00+2], srcData[idxS10+2],
    				srcData[idxS01+2], srcData[idxS11+2], dx, dy);

                //a
    			dstData[idxD+3] = inner(srcData[idxS00+3], srcData[idxS10+3],
    				srcData[idxS01+3], srcData[idxS11+3], dx, dy);

    			// log.debug(sprintf("pixel: j:%d, i:%d; r:%d, g:%d, b:%d", j, i, r, g, b));
    		}
    	}
    }
    return MinifyJpeg;
})();