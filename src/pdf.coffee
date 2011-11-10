class PDFObject
	constructor: (@value) ->
		
	toStringIndirect: (objectNumber, generationNumber = 0) ->
		if not @indirect
			@toString()
		else
			"""#{ objectNumber } #{ generationNumber } obj
			#{ @toString() }
			endobj
		"""
		
	toString: ->
		"#{ @value }"
		
	indirect: true
		
class PDFComment extends PDFObject
	toString: ->
		"%#{ @value }"
		
class PDFHeader extends PDFComment
	constructor: (@version) ->
		
	toString: ->
		@value = "PDF-#{ @version }"
		super()
		
	indirect: false
		
class PDFReference extends PDFObject
	constructor: (@objectNumber, @generationNumber) ->
		
	toString: ->
		"#{ @objectNumber } #{ @generationNumber } R"
	
class PDFBoolean extends PDFObject
	
class PDFNumber extends PDFObject
	
class PDFString extends PDFObject
	
	pdfEscapedString: ->
		@value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

	toString: ->
		"(#{ @pdfEscapedString() })"

class PDFText extends PDFObject
	constructor: (@value, @fontNumber, @fontSize, @position, @color) ->
		
	colorString: ->
		if @color then "#{ @color }\n" else ""

	fontString: ->
		if @fontNumber and @fontSize then "/F#{ @fontNumber } #{ @fontSize } Tf\n" else ""

	positionString: ->
		if @position then "#{ @position.x } #{ @position.y } Td\n" else ""

	valueString: ->
		if @value then "#{ @value } Tj\n" else ""

	toString: ->
		"""BT
		#{ @colorString() }#{ @fontString() }#{ @positionString() }#{ @valueString() }ET"""
		
	indirect: false
	
class PDFDateString extends PDFString
	constructor: (@value = new Date()) ->
	
	toString: ->
		if typeof @value isnt "string"
			@value = "D:#{ @value.getFullYear() }#{ @value.getMonth() + 1 }#{ @value.getDate() }#{ @value.getHours() }#{ @value.getMinutes() }#{ @value.getSeconds() }"
		super()

class PDFName extends PDFObject
	toString: ->
		"/#{ @value }"

class PDFArray extends PDFObject
	toString: ->
		string = "["
		for object, index in @value
			if index > 0
				string += " "
			string += object.toString()
			
		string += "]"

class PDFDictionary extends PDFObject
	toString: ->
		string = "<< "
		for key, value of @value
			if value is undefined then continue
			keyString = if key.charAt("0") is "/" then key else "/#{ key }"
			string += "\n#{ keyString } #{ value.toString() }"
		string += "\n>>"

class PDFStream extends PDFObject
	byteCache: (String.fromCharCode(n) for n in [0...256])
	
	bytesToString: (bytes) ->
		(@byteCache[byte] for byte in bytes).join("")
		
	stringToAscii85: (string) ->
			string += ("\0" for i in [0..3 - ((n - 1) % 4)]).join("")
			result = ""
			for stringPosition in [0...string.length] by 4
				base85Values = []
				bitValue = 0
				for n in [0..3]
					bitValue += string.charCodeAt(stringPosition + n) << ((3 - n) * 8)
				bitValue = (bitValue - (base85Values[n] = bitValue % 85)) / 85 for n in [4..0]
				result += @bytesToString((base85Value + 33) for base85Value in base85Values)
			result

	toString: ->
		"""stream
		#{ @value }
		endstream"""
		
class PDFPath extends PDFObject
	constructor: (@points, @strokeColor = null, @fillColor = null) ->
		
	fillColorString: ->
		if @fillColor then "#{ @fillColor }\n" else ""
		
	pointString: ->
		(("#{ point.x } #{ point.y } " + (if pointIndex is 0 then "m" else "l") + "\n") for point, pointIndex in @points).join("")
		
	strokeColorString: ->
		if @strokeColor then "#{ @strokeColor }\n" else ""
	
	styleString: ->
		if @strokeColor and @fillColor
			"B\n"
		else if @strokeColor
			"S\n"
		else if @fillColor
			"f\n"
		else
			""
		
	toString: ->
		"#{ @fillColorString() }#{ @strokeColorString() }#{ @pointString() }#{ @styleString() }"
		
	indirect: false
		
class PDFRectangle extends PDFPath
	constructor: (@point, @size, @strokeColor, @fillColor) ->
	
	toString: ->
		"#{ @fillColorString() }#{ @strokeColorString() }#{ @point.x } #{ @point.y } #{ @size.width } #{ @size.height } re\n#{ @styleString() }"
		
class PDFColor extends PDFObject
	constructor: ([@red, @green, @blue]) ->
	
	toString: ->
		"#{ Math.round(@red / 255, 2) } #{ Math.round(@green / 255, 2) } #{ Math.round(@blue / 255, 2) }"
		
class PDFStrokeColor extends PDFColor
	toString: ->
		"#{ super() } RG"

class PDFFillColor extends PDFColor
	toString: ->
		"#{ super() } rg"
		
class PDFXRef extends PDFObject
	constructor: (@subsections) ->
	
	subsectionsString: ->
		@subsections.join("")
	
	toString: ->
		"""xref
		#{ @subsectionsString() }"""
		
	indirect: false
		
class PDFXRefSubsection extends PDFObject
	constructor: (@entries, @start) ->
		
	entriesString: ->
		(entry.toString() for entry in @entries).join("")
		
	toString: ->
		"""#{ @start } #{ @start + @entries.length }
		#{ @entriesString() }
		"""
		
class PDFXRefEntry extends PDFObject
	constructor: (@byteOffset, @generation, @free) ->
		
	byteOffsetString: ->
		("0" for n in [@byteOffset.length...10]).join("") + @byteOffset
	
	generationString: ->
		("0" for n in [@generation.length...10]).join("") + @generation
		
	freeString: ->
		if @free then "f" else "n"
		
	toString: ->
		"#{ @byteOffsetString() } #{ @generationString() } #{ @freeString() } \n"
		
class PDFTrailer extends PDFDictionary
	constructor: (@xrefStart, @value) ->
	
	toString: ->
		"""trailer
		#{ super() }
		startxref
		#{ @xrefStart }
		%%EOF"""
		
	indirect: false

class PDFNull extends PDFObject
	toString: ->
		"null"
		
class PDFImage extends PDFObject
	constructor: (@position, @size, @imageData, @scale = 1) ->
		
	dictionaryString: ->
		@stream = "#{ @streamString() }"
		new PDFDictionary(
			BitsPerComponent: new PDFNumber(8)
			ColorSpace: new PDFName("RGB")
			Height: new PDFNumber(@size.height)
			Length: new PDFNumber(@stream.length)
			Subtype: new PDFName("Image")
			Type: new PDFName("XObject")
			Width: new PDFNumber(@size.width)
		)
		
	streamString: ->
		if typeof @imageData isnt "string"
			if @imageData.length / (@size.width * @size.height) is 4
				@imageData = (byte for byte, index in @imageData when (index + 1) % 4 isnt 0)
			@imageData = Crypto.charenc.Binary.bytesToString(@imageData)
		new PDFStream(@imageData)
		
	paintImageString: (imageName) ->
		"""
		#{ @size.width * @scale } 0 0 #{ @size.height * @scale } #{ @position.x } #{ @position.y } cm
		#{ imageName } Do
		"""
		
	toString: ->
		"""
		#{ @dictionaryString() }
		#{ @stream }"""

class PDFDocument
	constructor: (@version, @pageSize, @properties, @pageObjects, @resources, @script) ->
		
	addCatalog: ->
		@addObject("catalog",
			new PDFDictionary(
				Names: new PDFDictionary(
					JavaScript: @objectReferences.script
				)
				Type: new PDFName("Catalog")
				Pages: @objectReferences.pageTable
				OpenAction: new PDFArray([
					@objectReferences.pageTable,
					new PDFName("FitH"),
					new PDFNull()
				])
				PageLayout: new PDFName("OneColumn")
			)
		)
		
	addDocumentInformation: ->
		@addObject("documentInformation",
			new PDFDictionary(
				Title: new PDFString(@properties.title) if @properties.title
				Subject: new PDFString(@properties.subject) if @properties.subject
				Author: new PDFString(@properties.author) if @properties.author
				Keywords: new PDFString(@properties.keywords) if @properties.keywords
				Creator: new PDFString(@properties.creator) if @properties.creator
				CreationDate: new PDFDateString()
			)
		)
		
	addFontDictionary: ->
		@addObject("fontDefinition",
			new PDFDictionary(
				Type: new PDFName("Font")
				BaseFont: new PDFName("Helvetica")
				SubType: new PDFName("Type1")
				Encoding: new PDFName("WinAnsiEncoding")
			)
		)
		
	addObject: (objectName, object) ->
		@objectReferences[objectName] = new PDFReference(@objects.length, 0)
		@objects.push(object)
		
	addHeader: ->
		@objects.push(
			new PDFHeader(@version)
		)
		
	addPages: ->
		for pageObject, pageObjectIndex in @pageObjects
			pageObject.build(
				@objectReferences.pageTable,
				@objectReferences.resourceDictionary,
				@pageReference(pageObjectIndex, true)
			)
			@objects.push(pageObject.dictionary)
			@objects.push(pageObject.stream)
		@pagesEnd = @objects.length
		
	pageReference: (pageNumber, contents = false) ->
		new PDFReference((pageNumber + 1) * 2 + @objectReferences.resourceDictionary.objectNumber + (if contents then 1 else 0), 0)
		
	addPageTable: ->
		@addObject("pageTable",
			new PDFDictionary(
				Type: new PDFName("Pages")
				Kids: new PDFArray(
					(@pageReference(i) for i in [0...@pageObjects.length])
				)
				Count: new PDFNumber(@pageObjects.length)
				MediaBox: new PDFArray([
					new PDFNumber(0),
					new PDFNumber(0),
					new PDFNumber(@pageSize.width),
					new PDFNumber(@pageSize.height),
				])
			)
		)
		
	addXRefTable: ->
		@offsetSum = @offsets[1]
		@objects.push(
			new PDFXRef([
				new PDFXRefSubsection(((if i is 0 then new PDFXRefEntry(0, 65535, true) else new PDFXRefEntry(@offsetSum += @offsets[i], 0)) for i in [0...@objects.length]), 0)
			])
		)
		
	xObjectResourceDictionary: ->
		@xobjectResources = {}
		for resourceName, resource of @resources
			@xobjectResources[resourceName] = @objectReferences[resourceName]
	
	addResources: ->
		for resourceName, resource of @resources
			@addObject(resourceName, resource)
		
	addResourceDictionary: ->
		@addResources()
		@xObjectResourceDictionary()
		@addObject("resourceDictionary",
			new PDFDictionary(
				ProcSet: new PDFArray([
					new PDFName("PDF"),
					new PDFName("Text"),
					new PDFName("ImageC")
				])
				Font: new PDFDictionary(
					F1: @objectReferences.fontDefinition
				)
				XObject: new PDFDictionary(@xobjectResources)
			)
		)
		
	addTrailer: ->
		@objects.push(
			new PDFTrailer(@offsetSum,
				Size: new PDFNumber(@objects.length - 1)
				Root: @objectReferences.catalog
				Info: @objectReferences.documentInformation
			)
		)
		
	buildObjects: (start = 0, end = @objects.length) ->
		for object, objectIndex in @objects[start...end]
			objectString = "#{ object.toStringIndirect(objectIndex) }\n"
			if object.indirect
				@offsets[objectIndex] = objectString.length
			@buffer += objectString
			
	addScript: ->
		if @script
			@objects.push(@script)
			@addObject("script",
				new PDFDictionary(
					Names: new PDFArray([
						new PDFString("0000000000000000"),
						new PDFReference(@objects.length, 0)
					])
				)
			)
			
	addBody: ->
		@addScript()
		@addResourceDictionary()
		@addPageTable()
		@addPages()
		@addFontDictionary()
		@addDocumentInformation()
		@addCatalog()
		@buildObjects()
		
	addFooter: ->	
		@addXRefTable()
		@addTrailer()
		@buildObjects(@objects.length - 2)
		
	toDataUri: ->
		"data:application/pdf;base64,#{ Crypto.util.bytesToBase64(Crypto.charenc.Binary.stringToBytes(@toString())) }"
			
	toString: ->
		if not @buffer
			@addHeader()
			@addBody()
			@addFooter()
			
		@buffer
		
	buffer: ""
	objectReferences: {}
	objects: []
	offsets: []
	pages: 0

class PDFPage extends PDFObject
	add: (object) ->
		@objects.push(object)
		
	build: (pageTableReference, resourceDictionaryReference, contentsReference) ->
		@dictionary = new PDFDictionary(
			Type: new PDFName("Page")
			Parent: pageTableReference
			Resources: resourceDictionaryReference
			Contents: contentsReference
		)
		
		pageContents = @objects.join("\n")
		
		@stream = new PDFObject(
			new PDFDictionary(Length: pageContents.length) + "\n" + new PDFStream(pageContents)
		)
	
	objects: []
	
class PDFScript extends PDFObject
	constructor: (@fn) ->
		
	dictionaryString: ->
		new PDFDictionary(
			S: new PDFName("JavaScript")
			JS: new PDFString("#{ @functionString() }")
		)
		
	functionString: ->
		alert @fn.toString().slice(13, -1)
		@fn.toString().slice(13, -1)
		
	toString: ->
		"#{ @dictionaryString() }"
	
	