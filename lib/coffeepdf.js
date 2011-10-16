(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.jsPDF = (function() {
    function jsPDF(orientation, unit, format) {
      this.orientation = orientation != null ? orientation : "P";
      this.unit = unit != null ? unit : "mm";
      this.format = format != null ? format : "a4";
    }
    jsPDF.prototype.constants = {
      drawColor: "0 G",
      lineWidth: 0.200025,
      pageFormats: {
        a3: [841.89, 1190.55],
        a4: [595.28, 841.89],
        a5: [420.94, 595.28],
        letter: [612, 792],
        legal: [612, 1008]
      },
      textColor: "0 g",
      pdfVersion: "1.3",
      version: "20100328"
    };
    jsPDF.prototype.create = function() {
      this.getScaleFactor();
      this.getPageDimensions();
      this.getOrientation();
      this.addPage();
      this.jsPDF = {
        addPage: __bind(function() {
          this.addPage();
          return this.jsPDF;
        }, this),
        text: __bind(function(x, y, text) {
          var str;
          if (this.pageFontSize !== this.fontSize) {
            this.out("BT /F1 " + parseInt(this.fontSize) + ".00 Tf ET");
            this.pageFontSize = this.fontSize;
          }
          str = sprintf("BT %.2f %.2f Td (%s) Tj ET", x * this.scaleFactor, (this.pageHeight - y) * this.scaleFactor, this.pdfEscape(text));
          this.out(str);
          return this.jsPDF;
        }, this),
        line: __bind(function(x1, y1, x2, y2) {
          var str;
          str = sprintf("%.2f %.2f m %.2f %.2f l S", x1 * this.scaleFactor, (this.pageHeight - y1) * this.scaleFactor, x2 * this.scaleFactor, (this.pageHeight - y2) * this.scaleFactor);
          this.out(str);
          return this.jsPDF;
        }, this),
        rect: __bind(function(x, y, w, h, style) {
          var op;
          op = "S";
          if (style === "F") {
            op = "f";
          } else if (style === "FD" || style === "DF") {
            op = "B";
          }
          return this.out(sprintf("%.2f %.2f %.2f %.2f re %s", x * this.scaleFactor, (this.pageHeight - y) * this.scaleFactor, w * this.scaleFactor, -h * this.scaleFactor, op));
        }, this),
        setProperties: __bind(function(properties) {
          this.documentProperties = properties;
          return this.jsPDF;
        }, this),
        addImage: __bind(function(imageData, format, x, y, w, h) {
          return this.jsPDF;
        }, this),
        output: __bind(function(type, options) {
          this.endDocument();
          if (type === void 0) {
            return this.buffer;
          }
          if (type === "datauri") {
            return document.location.href = "data:application/pdf;base64," + Base64.encode(this.buffer);
          }
        }, this),
        setFontSize: __bind(function(size) {
          this.fontSize = size;
          return this.jsPDF;
        }, this),
        setLineWidth: __bind(function(width) {
          this.out(sprintf("%.2f w", width * this.scaleFactor));
          return this.jsPDF;
        }, this),
        setDrawColor: __bind(function(r, g, b) {
          var color;
          if ((r === 0 && g === 0 && b === 0) || g === void 0) {
            color = sprintf("%.3f G", r / 255);
          } else {
            color = sprintf("%.3f %.3f %.3f RG", r / 255, g / 255, b / 255);
          }
          this.out(color);
          return this.jsPDF;
        }, this)
      };
      return this.jsPDF;
    };
    jsPDF.prototype.getOrientation = function() {
      var _ref;
      this.orientation = this.orientation.toLowerCase();
      if (this.orientation === "p") {
        this.orientation = "portrait";
      }
      if (this.orientation === "l") {
        this.orientation = "landscape";
      }
      if (this.orientation === "landscape") {
        return _ref = [this.pageHeight, this.pageWidth], this.pageWidth = _ref[0], this.pageHeight = _ref[1], _ref;
      } else if (this.orientation !== "portrait") {
        throw "Invalid orientation " + orientation;
      }
    };
    jsPDF.prototype.getPageDimensions = function() {
      var _ref;
      if (typeof this.format === "string") {
        this.format = this.format.toLowerCase();
        if (this.format in this.constants.pageFormats) {
          this.pageHeight = this.constants.pageFormats[this.format][1] / this.scaleFactor;
          return this.pageWidth = this.constants.pageFormats[this.format][0] / this.scaleFactor;
        } else {
          throw "Invalid format " + this.format;
        }
      } else {
        return _ref = this.format, this.pageWidth = _ref[0], this.pageHeight = _ref[1], _ref;
      }
    };
    jsPDF.prototype.getScaleFactor = function() {
      switch (this.unit) {
        case "pt":
          return this.scaleFactor = 1;
        case "mm":
          return this.scaleFactor = 72 / 25.4;
        case "cm":
          return this.scaleFactor = 72 / 2.54;
        case "in":
          return this.scaleFactor = 72;
        default:
          throw "Invalid unit " + this.unit;
      }
    };
    jsPDF.prototype.newObject = function() {
      this.objectNumber += 1;
      this.offsets[this.objectNumber] = this.buffer.length;
      return this.out("" + this.objectNumber + " 0 obj");
    };
    jsPDF.prototype.putHeader = function() {
      return this.out("%PDF-" + this.constants.pdfVersion);
    };
    jsPDF.prototype.putPages = function() {
      var i, kids, n, p, pointSize, _ref, _ref2;
      pointSize = {
        height: this.pageHeight * this.scaleFactor,
        width: this.pageWidth * this.scaleFactor
      };
      for (n = 1, _ref = this.page; (1 <= _ref ? n <= _ref : n >= _ref); (1 <= _ref ? n += 1 : n -= 1)) {
        this.newObject();
        this.out("<</Type /Page");
        this.out("/Parent 1 0 R");
        this.out("/Resources 2 0 R");
        this.out("/Contents " + (this.objectNumber + 1) + " 0 R>>");
        this.out("endobj");
        p = this.pages[n];
        this.newObject();
        this.out("<</Length " + p.length + ">>");
        this.putStream(p);
        this.out("endobj");
      }
      this.offsets[1] = this.buffer.length;
      this.out("1 0 obj");
      this.out("<</Type /Pages");
      kids = "/Kids [";
      for (i = 0, _ref2 = this.page; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
        kids += (3 + 2 * i) + " 0 R ";
      }
      this.out(kids + "]");
      this.out("/Count " + this.page);
      this.out(sprintf("/MediaBox [0 0 %.2f %.2f]", pointSize.width, pointSize.height));
      this.out(">>");
      return this.out("endobj");
    };
    jsPDF.prototype.putStream = function(str) {
      this.out("stream");
      this.out(str);
      return this.out("endstream");
    };
    jsPDF.prototype.putResources = function() {
      this.putFonts();
      this.putImages();
      this.offsets[2] = this.buffer.length;
      this.out("2 0 obj");
      this.out("<<");
      this.putResourceDictionary();
      this.out(">>");
      return this.out("endobj");
    };
    jsPDF.prototype.putFonts = function() {
      var name;
      this.newObject();
      this.fontNumber = this.objectNumber;
      name = "Helvetica";
      this.out("<</Type /Font");
      this.out("/BaseFont /" + name);
      this.out("/Subtype /Type1");
      this.out("/Encoding /WinAnsiEncoding");
      this.out(">>");
      return this.out("endobj");
    };
    jsPDF.prototype.putImages = function() {};
    jsPDF.prototype.putResourceDictionary = function() {
      this.out("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]");
      this.out("/Font <<");
      this.out("/F1 " + this.fontNumber + " 0 R");
      this.out(">>");
      this.out("/XObject <<");
      this.putXobjectDict();
      return this.out(">>");
    };
    jsPDF.prototype.putXobjectDict = function() {};
    jsPDF.prototype.putInfo = function() {
      var created, day, hour, minute, month, second, year;
      this.out("/Producer (jsPDF " + this.constants.version + ")");
      if (this.documentProperties.title !== void 0) {
        this.out("/Title (" + this.pdfEscape(this.documentProperties.title) + ")");
      }
      if (this.documentProperties.subject !== void 0) {
        this.out("/Subject (" + this.pdfEscape(this.documentProperties.subject) + ")");
      }
      if (this.documentProperties.author !== void 0) {
        this.out("/Author (" + this.pdfEscape(this.documentProperties.author) + ")");
      }
      if (this.documentProperties.keywords !== void 0) {
        this.out("/Keywords (" + this.pdfEscape(this.documentProperties.keywords) + ")");
      }
      if (this.documentProperties.creator !== void 0) {
        this.out("/Creator (" + this.pdfEscape(this.documentProperties.creator) + ")");
      }
      created = new Date();
      year = created.getFullYear();
      month = created.getMonth() + 1;
      day = created.getDate();
      hour = created.getHours();
      minute = created.getMinutes();
      second = created.getSeconds();
      return this.out("/CreationDate (D:" + sprintf("%02d%02d%02d%02d%02d%02d", year, month, day, hour, minute, second) + ")");
    };
    jsPDF.prototype.putCatalog = function() {
      this.out("/Type /Catalog");
      this.out("/Pages 1 0 R");
      this.out("/OpenAction [3 0 R /FitH null]");
      return this.out("/PageLayout /OneColumn");
    };
    jsPDF.prototype.putTrailer = function() {
      this.out("/Size " + (this.objectNumber + 1));
      this.out("/Root " + this.objectNumber + " 0 R");
      return this.out("/Info " + (this.objectNumber - 1) + " 0 R");
    };
    jsPDF.prototype.endDocument = function() {
      var i, o, _ref;
      this.state = 1;
      this.putHeader();
      this.putPages();
      this.putResources();
      this.newObject();
      this.out("<<");
      this.putInfo();
      this.out(">>");
      this.out("endobj");
      this.newObject();
      this.out("<<");
      this.putCatalog();
      this.out(">>");
      this.out("endobj");
      o = this.buffer.length;
      this.out("xref");
      this.out("0 " + (this.objectNumber + 1));
      this.out("0000000000 65535 f ");
      for (i = 1, _ref = this.objectNumber; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
        this.out(sprintf("%010d 00000 n ", this.offsets[i]));
      }
      this.out("trailer");
      this.out("<<");
      this.putTrailer();
      this.out(">>");
      this.out("startxref");
      this.out(o);
      this.out("%%EOF");
      return this.state = 3;
    };
    jsPDF.prototype.beginPage = function() {
      this.page += 1;
      this.state = 2;
      return this.pages[this.page] = "";
    };
    jsPDF.prototype.out = function(string) {
      if (this.state === 2) {
        return this.pages[this.page] += string + "\n";
      } else {
        return this.buffer += string + "\n";
      }
    };
    jsPDF.prototype.addPage = function() {
      this.beginPage();
      this.out(sprintf("%.2f w", this.constants.lineWidth * this.scaleFactor));
      this.out(this.constants.drawColor);
      this.pageFontSize = this.fontSize;
      return this.out("BT /F1 " + parseInt(this.fontSize) + ".00 Tf ET");
    };
    jsPDF.prototype.pdfEscape = function(text) {
      return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    };
    jsPDF.prototype.buffer = "";
    jsPDF.prototype.documentProperties = {};
    jsPDF.prototype.fontNumber = void 0;
    jsPDF.prototype.fontSize = 16;
    jsPDF.prototype.objectNumber = 2;
    jsPDF.prototype.offsets = [];
    jsPDF.prototype.page = 0;
    jsPDF.prototype.pageFontSize = 16;
    jsPDF.prototype.pageHeight = void 0;
    jsPDF.prototype.pageWidth = void 0;
    jsPDF.prototype.pages = [];
    jsPDF.prototype.state = 0;
    return jsPDF;
  })();
}).call(this);