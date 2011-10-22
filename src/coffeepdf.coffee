Math._round = Math.round
Math.round = (number, precision = 0) ->
	Math._round(number * (coefficient = Math.pow(10, precision))) / coefficient

class window.CoffeePDF
	constructor: (@orientation = "portrait", @unit = "mm", @format = "a4") ->
		@init()
		
	constants:
		pageFormats:
			a3: { width: 841.89, height: 1190.55 }
			a4: { width: 595.28, height: 841.89 }
			a5: { width: 420.94, height: 595.28 }
			letter: { width: 612, height: 792 }
			legal: { width: 612, height: 1008 }

		pdfVersion: "1.6"
		version: "0.1"
	
	init: ->
		# These are 'private' functions
		getScaleFactor = =>
			switch @unit
				when "pt" then @scaleFactor = 1
				when "mm" then @scaleFactor = 72/25.4
				when "cm" then @scaleFactor = 72/2.54
				when "in" then @scaleFactor = 72
				else throw "Invalid unit #{ @unit }"

		getPageDimensions = =>
			if typeof @format is "string"
				if @format of @constants.pageFormats
					@pageSize = 
						height: @constants.pageFormats[@format].height / @scaleFactor
						width: @constants.pageFormats[@format].width / @scaleFactor
				else
					throw "Invalid format #{ @format }"
			else
				[@pageSize.width, @pageSize.height] = @format

		getOrientation = =>
			if @orientation is "landscape"
				[@pageSize.width, @pageSize.height] = [@pageSize.height, @pageSize.width]
			else if @orientation isnt "portrait"
				@orientation = "portrait"

		getScaleFactor()
		getPageDimensions()
		getOrientation()
		@addPage()
		
	setFontSize: (@fontSize) ->

	setProperties: (@documentProperties) ->

	addPage: -> @pages.push(new PDFPage())
	
	coordsOnPage: ({ x, y }) ->
		x: Math.round(x * @scaleFactor, 2)
		y: Math.round((@pageSize.height - y) * @scaleFactor, 2)
		
	sizeOnPage: ({ height, width }) ->
		height: height * @scaleFactor * -1
		width: width * @scaleFactor
		
	add: (object, pageNumber = @pages.length - 1) ->
		@pages[pageNumber].add(object)
	
	addText: (text, rawPoint) ->
		@add(
			new PDFText(
				new PDFString(text), 1, @fontSize, @coordsOnPage(rawPoint), new PDFFillColor([0, 0, 0])
			)
		)
		
	addPath: (rawPoints, strokeColor, fillColor) ->
		@add(
			new PDFPath(
				(@coordsOnPage(rawPoint) for rawPoint in rawPoints), 
				new PDFStrokeColor(strokeColor) if strokeColor,
				new PDFFillColor(fillColor) if fillColor
			)
		)
		
	addRectangle: (rawPoint, rawSize, strokeColor, fillColor) ->
		@add(
			new PDFRectangle(
				@coordsOnPage(rawPoint),
				@sizeOnPage(rawSize),
				new PDFStrokeColor(strokeColor) if strokeColor,
				new PDFFillColor(fillColor) if fillColor
			)
		)
		
	addResource: (resourceName, resource) ->
		@resources[resourceName] = resource
		
	addImageResource: (imageName, image) ->	
		@add(image.paintImageString(imageName))
		@addResource(imageName, image)
		
	addImage: (rawPoint, rawSize, imageData) ->
		@addImageResource(
			new PDFName("Image#{ @imageCount += 1 }"),
			new PDFImage(@coordsOnPage(rawPoint), rawSize, imageData, 0.5)
		)
	
	build: ->
		new PDFDocument(
			@constants.pdfVersion,
			{ width: @pageSize.width * @scaleFactor, height: @pageSize.height * @scaleFactor },
			@documentProperties,
			@pages,
			@resources
		)

	buffer: ""
	documentProperties: {}
	fontSize: 16
	imageCount: 0
	offsets: []
	pageFontSize: 16
	pageSize: {}
	pages: []
	resources: {}
