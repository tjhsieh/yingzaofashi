var zip2stl = (function(){
	var handle = {
		"zip": handleZip,
		"stl": handleSTL,
	};
	var zipboolean = new Boolean("true");
	var loaderDatas = function(){
		var datas = {
			type: '',
			mtl: [],
			jpg: [],
		};

		function SaveToDatas(filename, data){
			var extension = filename.split('.').pop().toLowerCase();
			if(handle.hasOwnProperty(extension)){
				datas.type = extension;
				datas[extension] = data;
			}
			else if(extension === "mtl"){
				datas.mtl.push(data);
			}
			else if(extension === "jpg"){
				datas.jpg.push({
					filename: filename,
					data: data,
				});
			}
			else{
				console.log("Not Accept Files: " + filename);
			}
		}

		return{
			SaveToDatas: SaveToDatas,
			datas: datas,
		}
	};

	function preLoad(datas, onend){ // only support handle one file, suggest using zip file
		
		for(var i in datas){
			var xhr = new XMLHttpRequest();
			
			xhr.open('GET', datas, true);
			xhr.responseType = 'blob';
			xhr.filename = datas;
			xhr.onload = function(e) {
				if (this.status == 200) {
					var myBlob = this.response;
					var filename = this.filename;
					var info = new loaderDatas();
					info.SaveToDatas(filename, myBlob);
					//var type = info.datas.type;
					handle[info.datas.type](info.datas, onend);
				}
			};
			xhr.send();
		}
	}

	function handleZip(datas, onend){
		var info = new loaderDatas();

		ZipModel.getEntries(datas.zip, function(entries) {
			entries.forEach(function(entry) {
				var writer, zipFileEntry;
				writer = new zip.BlobWriter();
				entry.getData(writer, function(blob) {

					info.SaveToDatas(entry.filename, blob);
						if(zipboolean){
						var type = info.datas.type;
						console.log(zipboolean);
						handle[type](info.datas, onend);
						zipboolean = !zipboolean;
						return;
						}

				}, function(message) {});
			});
		});
	}

	function handleSTL(datas, onend){
		readAsBinaryString(datas.stl, function(contents){
			var stlUrl = convertToUrl(contents);
			onend(stlUrl);
			//renderSTL(stlUrl);
		});
	}
		/*function renderSTL(stlUrl){
			var loader = new THREE.STLLoader();
			loader.addEventListener('load', function(event) {
				var geometry = event.content;
				var material = new THREE.MeshPhongMaterial({
					ambient: 0xff5533,
					color: 0xff5533,
					specular: 0x111111,
					shininess: 200
				});
				var mesh = new THREE.Mesh(geometry, material);

				mesh.position.set(0, 0, 0);
				// mesh.rotation.set( 0, - Math.PI / 2, 0 );
				mesh.scale.set( 10, 10, 10 );

				mesh.castShadow = true;
				mesh.receiveShadow = true;

				RenderManager.changeModel(mesh);

			});
			loader.load(stlUrl);
		}
	
*/
	function convertToUrl(content){
		var contentType = '';
		var sliceSize = 1024;
		var byteCharacters = content;
		var bytesLength = byteCharacters.length;
		var slicesCount = Math.ceil(bytesLength / sliceSize);
		var byteArrays = new Array(slicesCount);

		for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
			var begin = sliceIndex * sliceSize;
			var end = Math.min(begin + sliceSize, bytesLength);

			var bytes = new Array(end - begin);
			for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
				bytes[i] = byteCharacters[offset].charCodeAt(0);
			}
			byteArrays[sliceIndex] = new Uint8Array(bytes);
		}
		return window.URL.createObjectURL(new Blob(byteArrays, { type: contentType }));
	}

	function readAsText(file, callback){
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;
			callback(contents);
		}, false);
		reader.readAsText(file);
	}

	function readAsBinaryString(file, callback){
		var reader = new FileReader();
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;
			callback(contents);
		}, false);
		reader.readAsBinaryString(file);
	}

	function loadJPGS(datas, callback){
		console.log("loadJPGS");
		console.log(datas);
		var i = datas.jpg.length - 1;
		var jpgs = [];
		if(i >= 0){
			load(jpgs, i, datas, function(){
				console.log(jpgs);
				callback(jpgs);
			});
		}
		else{
			callback(jpgs);
		}

		function load(jpgs, i, datas, callback){
			readAsBinaryString(datas.jpg[i].data, function(contents){
				var jpgUrl = convertToUrl(contents).split("/");
				// console.log(jpgUrl);
				jpgs.push({
					from: datas.jpg[i].filename,
					to: jpgUrl[jpgUrl.length - 1],
				});
				if(i === 0){
					callback();
					return;
				}
				load(jpgs, i - 1, datas, callback)
			});
		}
	}

	return {
		preLoad: preLoad,
	};
})();
	
