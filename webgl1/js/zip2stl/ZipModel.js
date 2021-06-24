var ZipModel = (function() {
	var obj = window;
	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;
	var URL = obj.webkitURL || obj.mozURL || obj.URL;

	function onerror(message) {
		alert(message);
	}

	return {
		getEntries: function(file, onend) {
			zip.createReader(new zip.BlobReader(file), function(zipReader) {
				zipReader.getEntries(onend);
			}, onerror);
		}
	};
})();