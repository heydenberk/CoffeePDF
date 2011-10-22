(function() {
  var PDFArray, PDFBoolean, PDFColor, PDFComment, PDFDateString, PDFDictionary, PDFDocument, PDFFillColor, PDFHeader, PDFImage, PDFName, PDFNull, PDFNumber, PDFObject, PDFPage, PDFPath, PDFRectangle, PDFReference, PDFStream, PDFString, PDFStrokeColor, PDFText, PDFTrailer, PDFXRef, PDFXRefEntry, PDFXRefSubsection;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  PDFObject = (function() {
    function PDFObject(value) {
      this.value = value;
    }
    PDFObject.prototype.toStringIndirect = function(objectNumber, generationNumber) {
      if (generationNumber == null) {
        generationNumber = 0;
      }
      if (!this.indirect) {
        return this.toString();
      } else {
        return "" + objectNumber + " " + generationNumber + " obj\n" + (this.toString()) + "\nendobj";
      }
    };
    PDFObject.prototype.toString = function() {
      return "" + this.value;
    };
    PDFObject.prototype.indirect = true;
    return PDFObject;
  })();
  PDFComment = (function() {
    function PDFComment() {
      PDFComment.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFComment, PDFObject);
    PDFComment.prototype.toString = function() {
      return "%" + this.value;
    };
    return PDFComment;
  })();
  PDFHeader = (function() {
    __extends(PDFHeader, PDFComment);
    function PDFHeader(version) {
      this.version = version;
    }
    PDFHeader.prototype.toString = function() {
      this.value = "PDF-" + this.version;
      return PDFHeader.__super__.toString.call(this);
    };
    PDFHeader.prototype.indirect = false;
    return PDFHeader;
  })();
  PDFReference = (function() {
    __extends(PDFReference, PDFObject);
    function PDFReference(objectNumber, generationNumber) {
      this.objectNumber = objectNumber;
      this.generationNumber = generationNumber;
    }
    PDFReference.prototype.toString = function() {
      return "" + this.objectNumber + " " + this.generationNumber + " R";
    };
    return PDFReference;
  })();
  PDFBoolean = (function() {
    function PDFBoolean() {
      PDFBoolean.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFBoolean, PDFObject);
    return PDFBoolean;
  })();
  PDFNumber = (function() {
    function PDFNumber() {
      PDFNumber.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFNumber, PDFObject);
    return PDFNumber;
  })();
  PDFString = (function() {
    function PDFString() {
      PDFString.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFString, PDFObject);
    PDFString.prototype.pdfEscapedString = function() {
      return this.value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    };
    PDFString.prototype.toString = function() {
      return "(" + (this.pdfEscapedString()) + ")";
    };
    return PDFString;
  })();
  PDFText = (function() {
    __extends(PDFText, PDFObject);
    function PDFText(value, fontNumber, fontSize, position, color) {
      this.value = value;
      this.fontNumber = fontNumber;
      this.fontSize = fontSize;
      this.position = position;
      this.color = color;
    }
    PDFText.prototype.colorString = function() {
      if (this.color) {
        return "" + this.color + "\n";
      } else {
        return "";
      }
    };
    PDFText.prototype.fontString = function() {
      if (this.fontNumber && this.fontSize) {
        return "/F" + this.fontNumber + " " + this.fontSize + " Tf\n";
      } else {
        return "";
      }
    };
    PDFText.prototype.positionString = function() {
      if (this.position) {
        return "" + this.position.x + " " + this.position.y + " Td\n";
      } else {
        return "";
      }
    };
    PDFText.prototype.valueString = function() {
      if (this.value) {
        return "" + this.value + " Tj\n";
      } else {
        return "";
      }
    };
    PDFText.prototype.toString = function() {
      return "BT\n" + (this.colorString()) + (this.fontString()) + (this.positionString()) + (this.valueString()) + "ET";
    };
    PDFText.prototype.indirect = false;
    return PDFText;
  })();
  PDFDateString = (function() {
    __extends(PDFDateString, PDFString);
    function PDFDateString(value) {
      this.value = value != null ? value : new Date();
    }
    PDFDateString.prototype.toString = function() {
      if (typeof this.value !== "string") {
        this.value = "D:" + (this.value.getFullYear()) + (this.value.getMonth() + 1) + (this.value.getDate()) + (this.value.getHours()) + (this.value.getMinutes()) + (this.value.getSeconds());
      }
      return PDFDateString.__super__.toString.call(this);
    };
    return PDFDateString;
  })();
  PDFName = (function() {
    function PDFName() {
      PDFName.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFName, PDFObject);
    PDFName.prototype.toString = function() {
      return "/" + this.value;
    };
    return PDFName;
  })();
  PDFArray = (function() {
    function PDFArray() {
      PDFArray.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFArray, PDFObject);
    PDFArray.prototype.toString = function() {
      var index, object, string, _len, _ref;
      string = "[";
      _ref = this.value;
      for (index = 0, _len = _ref.length; index < _len; index++) {
        object = _ref[index];
        if (index > 0) {
          string += " ";
        }
        string += object.toString();
      }
      return string += "]";
    };
    return PDFArray;
  })();
  PDFDictionary = (function() {
    function PDFDictionary() {
      PDFDictionary.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFDictionary, PDFObject);
    PDFDictionary.prototype.toString = function() {
      var key, keyString, string, value, _ref;
      string = "<< ";
      _ref = this.value;
      for (key in _ref) {
        value = _ref[key];
        if (value === void 0) {
          continue;
        }
        keyString = key.charAt("0") === "/" ? key : "/" + key;
        string += "\n" + keyString + " " + (value.toString());
      }
      return string += "\n>>";
    };
    return PDFDictionary;
  })();
  PDFStream = (function() {
    var n;
    function PDFStream() {
      PDFStream.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFStream, PDFObject);
    PDFStream.prototype.byteCache = (function() {
      var _results;
      _results = [];
      for (n = 0; n < 256; n++) {
        _results.push(String.fromCharCode(n));
      }
      return _results;
    })();
    PDFStream.prototype.bytesToString = function(bytes) {
      var byte;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = bytes.length; _i < _len; _i++) {
          byte = bytes[_i];
          _results.push(this.byteCache[byte]);
        }
        return _results;
      }).call(this)).join("");
    };
    PDFStream.prototype.stringToAscii85 = function(string) {
      var base85Value, base85Values, bitValue, i, n, result, stringPosition, _ref;
      string += ((function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = 3 - ((n - 1) % 4); (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          _results.push("\0");
        }
        return _results;
      })()).join("");
      result = "";
      for (stringPosition = 0, _ref = string.length; (0 <= _ref ? stringPosition < _ref : stringPosition > _ref); stringPosition += 4) {
        base85Values = [];
        bitValue = 0;
        for (n = 0; n <= 3; n++) {
          bitValue += string.charCodeAt(stringPosition + n) << ((3 - n) * 8);
        }
        for (n = 4; n >= 0; n--) {
          bitValue = (bitValue - (base85Values[n] = bitValue % 85)) / 85;
        }
        result += this.bytesToString((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = base85Values.length; _i < _len; _i++) {
            base85Value = base85Values[_i];
            _results.push(base85Value + 33);
          }
          return _results;
        })());
      }
      return result;
    };
    PDFStream.prototype.toString = function() {
      return "stream\n" + this.value + "\nendstream";
    };
    return PDFStream;
  })();
  PDFPath = (function() {
    __extends(PDFPath, PDFObject);
    function PDFPath(points, strokeColor, fillColor) {
      this.points = points;
      this.strokeColor = strokeColor != null ? strokeColor : null;
      this.fillColor = fillColor != null ? fillColor : null;
    }
    PDFPath.prototype.fillColorString = function() {
      if (this.fillColor) {
        return "" + this.fillColor + "\n";
      } else {
        return "";
      }
    };
    PDFPath.prototype.pointString = function() {
      var point, pointIndex;
      return ((function() {
        var _len, _ref, _results;
        _ref = this.points;
        _results = [];
        for (pointIndex = 0, _len = _ref.length; pointIndex < _len; pointIndex++) {
          point = _ref[pointIndex];
          _results.push(("" + point.x + " " + point.y + " ") + (pointIndex === 0 ? "m" : "l") + "\n");
        }
        return _results;
      }).call(this)).join("");
    };
    PDFPath.prototype.strokeColorString = function() {
      if (this.strokeColor) {
        return "" + this.strokeColor + "\n";
      } else {
        return "";
      }
    };
    PDFPath.prototype.styleString = function() {
      if (this.strokeColor && this.fillColor) {
        return "B\n";
      } else if (this.strokeColor) {
        return "S\n";
      } else if (this.fillColor) {
        return "f\n";
      } else {
        return "";
      }
    };
    PDFPath.prototype.toString = function() {
      return "" + (this.fillColorString()) + (this.strokeColorString()) + (this.pointString()) + (this.styleString());
    };
    PDFPath.prototype.indirect = false;
    return PDFPath;
  })();
  PDFRectangle = (function() {
    __extends(PDFRectangle, PDFPath);
    function PDFRectangle(point, size, strokeColor, fillColor) {
      this.point = point;
      this.size = size;
      this.strokeColor = strokeColor;
      this.fillColor = fillColor;
    }
    PDFRectangle.prototype.toString = function() {
      return "" + (this.fillColorString()) + (this.strokeColorString()) + this.point.x + " " + this.point.y + " " + this.size.width + " " + this.size.height + " re\n" + (this.styleString());
    };
    return PDFRectangle;
  })();
  PDFColor = (function() {
    __extends(PDFColor, PDFObject);
    function PDFColor(_arg) {
      this.red = _arg[0], this.green = _arg[1], this.blue = _arg[2];
    }
    PDFColor.prototype.toString = function() {
      return "" + (Math.round(this.red / 255, 2)) + " " + (Math.round(this.green / 255, 2)) + " " + (Math.round(this.blue / 255, 2));
    };
    return PDFColor;
  })();
  PDFStrokeColor = (function() {
    function PDFStrokeColor() {
      PDFStrokeColor.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFStrokeColor, PDFColor);
    PDFStrokeColor.prototype.toString = function() {
      return "" + (PDFStrokeColor.__super__.toString.call(this)) + " RG";
    };
    return PDFStrokeColor;
  })();
  PDFFillColor = (function() {
    function PDFFillColor() {
      PDFFillColor.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFFillColor, PDFColor);
    PDFFillColor.prototype.toString = function() {
      return "" + (PDFFillColor.__super__.toString.call(this)) + " rg";
    };
    return PDFFillColor;
  })();
  PDFXRef = (function() {
    __extends(PDFXRef, PDFObject);
    function PDFXRef(subsections) {
      this.subsections = subsections;
    }
    PDFXRef.prototype.subsectionsString = function() {
      return this.subsections.join("");
    };
    PDFXRef.prototype.toString = function() {
      return "xref\n" + (this.subsectionsString());
    };
    PDFXRef.prototype.indirect = false;
    return PDFXRef;
  })();
  PDFXRefSubsection = (function() {
    __extends(PDFXRefSubsection, PDFObject);
    function PDFXRefSubsection(entries, start) {
      this.entries = entries;
      this.start = start;
    }
    PDFXRefSubsection.prototype.entriesString = function() {
      var entry;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.entries;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          _results.push(entry.toString());
        }
        return _results;
      }).call(this)).join("");
    };
    PDFXRefSubsection.prototype.toString = function() {
      return "" + this.start + " " + (this.start + this.entries.length) + "\n" + (this.entriesString());
    };
    return PDFXRefSubsection;
  })();
  PDFXRefEntry = (function() {
    __extends(PDFXRefEntry, PDFObject);
    function PDFXRefEntry(byteOffset, generation, free) {
      this.byteOffset = byteOffset;
      this.generation = generation;
      this.free = free;
    }
    PDFXRefEntry.prototype.byteOffsetString = function() {
      var n;
      return ((function() {
        var _ref, _results;
        _results = [];
        for (n = _ref = this.byteOffset.length; (_ref <= 10 ? n < 10 : n > 10); (_ref <= 10 ? n += 1 : n -= 1)) {
          _results.push("0");
        }
        return _results;
      }).call(this)).join("") + this.byteOffset;
    };
    PDFXRefEntry.prototype.generationString = function() {
      var n;
      return ((function() {
        var _ref, _results;
        _results = [];
        for (n = _ref = this.generation.length; (_ref <= 10 ? n < 10 : n > 10); (_ref <= 10 ? n += 1 : n -= 1)) {
          _results.push("0");
        }
        return _results;
      }).call(this)).join("") + this.generation;
    };
    PDFXRefEntry.prototype.freeString = function() {
      if (this.free) {
        return "f";
      } else {
        return "n";
      }
    };
    PDFXRefEntry.prototype.toString = function() {
      return "" + (this.byteOffsetString()) + " " + (this.generationString()) + " " + (this.freeString()) + " \n";
    };
    return PDFXRefEntry;
  })();
  PDFTrailer = (function() {
    __extends(PDFTrailer, PDFDictionary);
    function PDFTrailer(xrefStart, value) {
      this.xrefStart = xrefStart;
      this.value = value;
    }
    PDFTrailer.prototype.toString = function() {
      return "trailer\n" + (PDFTrailer.__super__.toString.call(this)) + "\nstartxref\n" + this.xrefStart + "\n%%EOF";
    };
    PDFTrailer.prototype.indirect = false;
    return PDFTrailer;
  })();
  PDFNull = (function() {
    function PDFNull() {
      PDFNull.__super__.constructor.apply(this, arguments);
    }
    __extends(PDFNull, PDFObject);
    PDFNull.prototype.toString = function() {
      return "null";
    };
    return PDFNull;
  })();
  PDFImage = (function() {
    __extends(PDFImage, PDFObject);
    function PDFImage(position, size, imageData, scale) {
      this.position = position;
      this.size = size;
      this.imageData = imageData;
      this.scale = scale != null ? scale : 1;
    }
    PDFImage.prototype.dictionaryString = function() {
      this.stream = "" + (this.streamString());
      return new PDFDictionary({
        BitsPerComponent: new PDFNumber(8),
        ColorSpace: new PDFName("RGB"),
        Height: new PDFNumber(this.size.height),
        Length: new PDFNumber(this.stream.length),
        Subtype: new PDFName("Image"),
        Type: new PDFName("XObject"),
        Width: new PDFNumber(this.size.width)
      });
    };
    PDFImage.prototype.streamString = function() {
      return new PDFStream(typeof this.imageData !== "string" ? Crypto.charenc.Binary.bytesToString(this.imageData) : this.imageData);
    };
    PDFImage.prototype.paintImageString = function(imageName) {
      return "" + (this.size.width * this.scale) + " 0 0 " + (this.size.height * this.scale) + " " + this.position.x + " " + this.position.y + " cm\n" + imageName + " Do";
    };
    PDFImage.prototype.toString = function() {
      return "" + (this.dictionaryString()) + "\n" + this.stream;
    };
    return PDFImage;
  })();
  PDFDocument = (function() {
    function PDFDocument(version, pageSize, properties, pageObjects, resources) {
      this.version = version;
      this.pageSize = pageSize;
      this.properties = properties;
      this.pageObjects = pageObjects;
      this.resources = resources;
    }
    PDFDocument.prototype.addCatalog = function() {
      return this.objects.push(new PDFDictionary({
        Type: new PDFName("Catalog"),
        Pages: this.objectReferences.pageTable,
        OpenAction: new PDFArray([new PDFReference(3, 0), new PDFName("FitH"), new PDFNull()]),
        PageLayout: new PDFName("OneColumn")
      }));
    };
    PDFDocument.prototype.addDocumentInformation = function() {
      return this.objects.push(new PDFDictionary({
        Title: this.properties.title ? new PDFString(this.properties.title) : void 0,
        Subject: this.properties.subject ? new PDFString(this.properties.subject) : void 0,
        Author: this.properties.author ? new PDFString(this.properties.author) : void 0,
        Keywords: this.properties.keywords ? new PDFString(this.properties.keywords) : void 0,
        Creator: this.properties.creator ? new PDFString(this.properties.creator) : void 0,
        CreationDate: new PDFDateString()
      }));
    };
    PDFDocument.prototype.addFontDictionary = function() {
      return this.addObject("fontDefinition", new PDFDictionary({
        Type: new PDFName("Font"),
        BaseFont: new PDFName("Helvetica"),
        SubType: new PDFName("Type1"),
        Encoding: new PDFName("WinAnsiEncoding")
      }));
    };
    PDFDocument.prototype.addObject = function(objectName, object) {
      this.objectReferences[objectName] = new PDFReference(this.objects.length, 0);
      return this.objects.push(object);
    };
    PDFDocument.prototype.addHeader = function() {
      return this.objects.push(new PDFHeader(this.version));
    };
    PDFDocument.prototype.addPages = function() {
      var pageObject, pageObjectIndex, _len, _ref;
      _ref = this.pageObjects;
      for (pageObjectIndex = 0, _len = _ref.length; pageObjectIndex < _len; pageObjectIndex++) {
        pageObject = _ref[pageObjectIndex];
        pageObject.build(this.objectReferences.pageTable, this.objectReferences.resourceDictionary, this.pageReference(pageObjectIndex, true));
        this.objects.push(pageObject.dictionary);
        this.objects.push(pageObject.stream);
      }
      return this.pagesEnd = this.objects.length;
    };
    PDFDocument.prototype.pageReference = function(pageNumber, contents) {
      if (contents == null) {
        contents = false;
      }
      return new PDFReference((pageNumber + 1) * 2 + this.objectReferences.resourceDictionary.objectNumber + (contents ? 1 : 0), 0);
    };
    PDFDocument.prototype.addPageTable = function() {
      var i;
      return this.addObject("pageTable", new PDFDictionary({
        Type: new PDFName("Pages"),
        Kids: new PDFArray((function() {
          var _ref, _results;
          _results = [];
          for (i = 0, _ref = this.pageObjects.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
            _results.push(this.pageReference(i));
          }
          return _results;
        }).call(this)),
        Count: new PDFNumber(this.pageObjects.length),
        MediaBox: new PDFArray([new PDFNumber(0), new PDFNumber(0), new PDFNumber(this.pageSize.width), new PDFNumber(this.pageSize.height)])
      }));
    };
    PDFDocument.prototype.addXRefTable = function() {
      var i;
      this.offsetSum = this.offsets[1];
      return this.objects.push(new PDFXRef([
        new PDFXRefSubsection((function() {
          var _ref, _results;
          _results = [];
          for (i = 0, _ref = this.objects.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
            _results.push((i === 0 ? new PDFXRefEntry(0, 65535, true) : new PDFXRefEntry(this.offsetSum += this.offsets[i], 0)));
          }
          return _results;
        }).call(this), 0)
      ]));
    };
    PDFDocument.prototype.xObjectResourceDictionary = function() {
      var resource, resourceName, _ref, _results;
      this.xobjectResources = {};
      _ref = this.resources;
      _results = [];
      for (resourceName in _ref) {
        resource = _ref[resourceName];
        _results.push(this.xobjectResources[resourceName] = this.objectReferences[resourceName]);
      }
      return _results;
    };
    PDFDocument.prototype.addResources = function() {
      var resource, resourceName, _ref, _results;
      _ref = this.resources;
      _results = [];
      for (resourceName in _ref) {
        resource = _ref[resourceName];
        _results.push(this.addObject(resourceName, resource));
      }
      return _results;
    };
    PDFDocument.prototype.addResourceDictionary = function() {
      this.addResources();
      this.xObjectResourceDictionary();
      return this.addObject("resourceDictionary", new PDFDictionary({
        ProcSet: new PDFArray([new PDFName("PDF"), new PDFName("Text"), new PDFName("ImageC")]),
        Font: new PDFDictionary({
          F1: this.objectReferences.fontDefinition
        }),
        XObject: new PDFDictionary(this.xobjectResources)
      }));
    };
    PDFDocument.prototype.addTrailer = function() {
      return this.objects.push(new PDFTrailer(this.offsetSum, {
        Size: new PDFNumber(this.objects.length - 1),
        Root: new PDFReference(this.objects.length - 2, 0),
        Info: new PDFReference(this.objects.length - 3, 0)
      }));
    };
    PDFDocument.prototype.buildObjects = function(start, end) {
      var object, objectIndex, objectString, _len, _ref, _results;
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = this.objects.length;
      }
      _ref = this.objects.slice(start, end);
      _results = [];
      for (objectIndex = 0, _len = _ref.length; objectIndex < _len; objectIndex++) {
        object = _ref[objectIndex];
        objectString = "" + (object.toStringIndirect(objectIndex)) + "\n";
        if (object.indirect) {
          this.offsets[objectIndex] = objectString.length;
        }
        _results.push(this.buffer += objectString);
      }
      return _results;
    };
    PDFDocument.prototype.addBody = function() {
      this.addResourceDictionary();
      this.addPageTable();
      this.addPages();
      this.addFontDictionary();
      this.addDocumentInformation();
      this.addCatalog();
      return this.buildObjects();
    };
    PDFDocument.prototype.addFooter = function() {
      this.addXRefTable();
      this.addTrailer();
      return this.buildObjects(this.objects.length - 2);
    };
    PDFDocument.prototype.toDataUri = function() {
      return "data:application/pdf;base64," + (Crypto.util.bytesToBase64(Crypto.charenc.Binary.stringToBytes(this.toString())));
    };
    PDFDocument.prototype.toString = function() {
      if (!this.buffer) {
        this.addHeader();
        this.addBody();
        this.addFooter();
      }
      return this.buffer;
    };
    PDFDocument.prototype.buffer = "";
    PDFDocument.prototype.objectReferences = {};
    PDFDocument.prototype.objects = [];
    PDFDocument.prototype.offsets = [];
    PDFDocument.prototype.pages = 0;
    return PDFDocument;
  })();
  PDFPage = (function() {
    function PDFPage() {}
    PDFPage.prototype.add = function(object) {
      return this.objects.push(object);
    };
    PDFPage.prototype.build = function(pageTableReference, resourceDictionaryReference, contentsReference) {
      var pageContents;
      this.dictionary = new PDFDictionary({
        Type: new PDFName("Page"),
        Parent: pageTableReference,
        Resources: resourceDictionaryReference,
        Contents: contentsReference
      });
      pageContents = this.objects.join("\n");
      return this.stream = new PDFObject(new PDFDictionary({
        Length: pageContents.length
      }) + "\n" + new PDFStream(pageContents));
    };
    PDFPage.prototype.objects = [];
    return PDFPage;
  })();
}).call(this);
