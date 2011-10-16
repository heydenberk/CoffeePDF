class window.jsPDF
	constructor: (@orientation = "P", @unit = "mm", @format = "a4") ->
		
	constants:
		drawColor: "0 G"
		lineWidth: 0.200025
		pageFormats: # Size in pt of various paper formats
			a3: [841.89, 1190.55]
			a4: [595.28, 841.89]
			a5: [420.94, 595.28]
			letter: [612, 792]
			legal: [612, 1008]
		textColor: "0 g"
		pdfVersion: "1.3"
		version: "20100328"
		
	create: ->
		@getScaleFactor()
		@getPageDimensions()
		@getOrientation()
		@addPage()
		
		@jsPDF =		
			addPage: =>
				@addPage()
				@jsPDF
				
			text: (x, y, text) =>
				# need page height
				if @pageFontSize != @fontSize
					@out("BT /F1 " + parseInt(@fontSize) + ".00 Tf ET")
					@pageFontSize = @fontSize
					
				str = sprintf("BT %.2f %.2f Td (%s) Tj ET", x * @scaleFactor, (@pageHeight - y) * @scaleFactor, @pdfEscape(text))
				@out(str)
				@jsPDF

			line: (x1, y1, x2, y2) =>
				str = sprintf("%.2f %.2f m %.2f %.2f l S",x1 * @scaleFactor, (@pageHeight - y1) * @scaleFactor, x2 * @scaleFactor, (@pageHeight - y2) * @scaleFactor)
				@out(str)
				@jsPDF

			rect: (x, y, w, h, style) =>
				op = "S"
				if style is "F"
					op = "f"
				else if style is "FD" or style is "DF"
					op = "B"
				@out(sprintf("%.2f %.2f %.2f %.2f re %s", x * @scaleFactor, (@pageHeight - y) * @scaleFactor, w * @scaleFactor, -h * @scaleFactor, op))

			setProperties: (properties) =>
				@documentProperties = properties
				@jsPDF
				
			addImage: (imageData, format, x, y, w, h) =>
				@jsPDF
				
			output: (type, options) =>
				@endDocument()
				if type is undefined
					return @buffer
				if type is "datauri"
					document.location.href = "data:application/pdf;base64," + Base64.encode(@buffer)
			setFontSize: (size) =>
				@fontSize = size
				@jsPDF
				
			setLineWidth: (width) =>
				@out(sprintf("%.2f w", (width * @scaleFactor)))
				@jsPDF
				
			setDrawColor: (r,g,b) =>
				if (r is 0 and g is 0 and b is 0) or g is undefined
					color = sprintf("%.3f G", r/255)
				else
					color = sprintf("%.3f %.3f %.3f RG", r/255, g/255, b/255)
				@out(color)
				@jsPDF
		
		return @jsPDF	
		
	getOrientation: ->
		@orientation = @orientation.toLowerCase()
		if @orientation is "p" then @orientation = "portrait"
		if @orientation is "l" then @orientation = "landscape"
		
		if @orientation is "landscape"
			[@pageWidth, @pageHeight] = [@pageHeight, @pageWidth]
		else if @orientation isnt "portrait"
			throw "Invalid orientation #{ orientation }"
		
	getPageDimensions: ->
		if typeof @format is "string"
			@format = @format.toLowerCase()
			if @format of @constants.pageFormats
				@pageHeight = @constants.pageFormats[@format][1] / @scaleFactor
				@pageWidth = @constants.pageFormats[@format][0] / @scaleFactor
			else
				throw "Invalid format #{ @format }"
		else
			[@pageWidth, @pageHeight] = @format
		
	getScaleFactor: ->
		switch @unit
			when "pt" then @scaleFactor = 1
			when "mm" then @scaleFactor = 72/25.4
			when "cm" then @scaleFactor = 72/2.54
			when "in" then @scaleFactor = 72
			else throw "Invalid unit #{ @unit }"
			
	newObject: ->
		@objectNumber += 1
		@offsets[@objectNumber] = @buffer.length
		@out("#{ @objectNumber } 0 obj")
		
	putHeader: ->
		@out("%PDF-" + @constants.pdfVersion)
		
	putPages: ->
		pointSize =
			height: @pageHeight * @scaleFactor
			width: @pageWidth * @scaleFactor
			
		for n in [1..@page]
			@newObject()
			@out("<</Type /Page")
			@out("/Parent 1 0 R")	
			@out("/Resources 2 0 R")
			@out("/Contents " + (@objectNumber + 1) + " 0 R>>")
			@out("endobj")
			
			# Page content
			p = @pages[n]
			@newObject()
			@out("<</Length " + p.length  + ">>")
			@putStream(p)
			@out("endobj")
			
		@offsets[1] = @buffer.length
		@out("1 0 obj")
		@out("<</Type /Pages")
		kids = "/Kids ["
		for i in [0...@page]
			kids += (3 + 2 * i) + " 0 R "

		@out(kids + "]")
		@out("/Count " + @page)
		@out(sprintf("/MediaBox [0 0 %.2f %.2f]", pointSize.width, pointSize.height))
		@out(">>")
		@out("endobj")
		
	putStream: (str) ->
		@out("stream")
		@out(str)
		@out("endstream")
		
	putResources: ->
		@putFonts()
		@putImages()
		
		# Resource dictionary
		@offsets[2] = @buffer.length
		@out("2 0 obj")
		@out("<<")
		@putResourceDictionary()
		@out(">>")
		@out("endobj")
		
	putFonts: ->
		@newObject()
		@fontNumber = @objectNumber
		name = "Helvetica"
		@out("<</Type /Font")
		@out("/BaseFont /#{ name }")
		@out("/Subtype /Type1")
		@out("/Encoding /WinAnsiEncoding")
		@out(">>")
		@out("endobj")
		
	putImages: ->
		#@TODO
		
	putResourceDictionary: ->
		@out("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]")
		@out("/Font <<")
		# Do this for each font, the "1" bit is the index of the font
		# fontNumber is currently the object number related to "putFonts"
		@out("/F1 #{ @fontNumber } 0 R")
		@out(">>")
		@out("/XObject <<")
		@putXobjectDict()
		@out(">>")
		
	putXobjectDict: ->
		#@TODO
		
	putInfo: ->
		@out("/Producer (jsPDF " + @constants.version + ")")
		if @documentProperties.title isnt undefined
			@out("/Title (" + @pdfEscape(@documentProperties.title) + ")")

		if @documentProperties.subject isnt undefined
			@out("/Subject (" + @pdfEscape(@documentProperties.subject) + ")")
		
		if @documentProperties.author isnt undefined
			@out("/Author (" + @pdfEscape(@documentProperties.author) + ")")

		if @documentProperties.keywords isnt undefined
			@out("/Keywords (" + @pdfEscape(@documentProperties.keywords) + ")")

		if @documentProperties.creator isnt undefined
			@out("/Creator (" + @pdfEscape(@documentProperties.creator) + ")")

		created = new Date()
		year = created.getFullYear()
		month = (created.getMonth() + 1)
		day = created.getDate()
		hour = created.getHours()
		minute = created.getMinutes()
		second = created.getSeconds()
		@out("/CreationDate (D:" + sprintf("%02d%02d%02d%02d%02d%02d", year, month, day, hour, minute, second) + ")")
		
	putCatalog: ->
		@out("/Type /Catalog")
		@out("/Pages 1 0 R")
		# @TODO: Add zoom and layout modes
		@out("/OpenAction [3 0 R /FitH null]")
		@out("/PageLayout /OneColumn")	
	
	putTrailer: ->
		@out("/Size " + (@objectNumber + 1))
		@out("/Root " + @objectNumber + " 0 R")
		@out("/Info " + (@objectNumber - 1) + " 0 R")
	
	endDocument: ->
		@state = 1
		@putHeader()
		@putPages()
		
		@putResources()
		# Info
		@newObject()
		@out("<<")
		@putInfo()
		@out(">>")
		@out("endobj")
		
		# Catalog
		@newObject()
		@out("<<")
		@putCatalog()
		@out(">>")
		@out("endobj")
		
		# Cross-ref
		o = @buffer.length
		@out("xref")
		@out("0 " + (@objectNumber + 1))
		@out("0000000000 65535 f ")
		for i in [1..@objectNumber]
			@out(sprintf("%010d 00000 n ", @offsets[i]))
		# Trailer
		@out("trailer")
		@out("<<")
		@putTrailer()
		@out(">>")
		@out("startxref")
		@out(o)
		@out("%%EOF")
		@state = 3
	
	beginPage: ->
		@page += 1
		# Do dimension stuff
		@state = 2
		@pages[@page] = ""
	
	out: (string) ->
		if @state is 2
			@pages[@page] += string + "\n"
		else
			@buffer += string + "\n"
	
	addPage: ->
		@beginPage()
		# Set line width
		@out(sprintf("%.2f w", (@constants.lineWidth * @scaleFactor)))
		# Set draw color
		@out(@constants.drawColor)
		
		# Set font - TODO
		# 16 is the font size
		@pageFontSize = @fontSize
		@out("BT /F1 " + parseInt(@fontSize) + ".00 Tf ET")
	# Escape text
	pdfEscape: (text) ->
		text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
		
	buffer: ""
	documentProperties: {}
	fontNumber: undefined
	fontSize: 16
	objectNumber: 2
	offsets: []
	page: 0
	pageFontSize: 16
	pageHeight: undefined
	pageWidth: undefined
	pages: []
	state: 0
