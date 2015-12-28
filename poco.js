var poco = (function () {

	var table = {}, 
	roots = [
		'C','C#','D','Eb','E', 'F','F#','G','Ab','A','Bb','B'
	],
	variations = [
		'', 'min', 'aug', 'dim', 'sus4', 
		'maj7', 'min7', '7#5', '7b5', 'dim7', '7sus4',
		'7', 'mM7', 'm7#5',  'm7b5', 'sus2',
		'6', 'm6', '9', '6add9', 'm9', '9#5', '9b5', 'add9',
		'maj7b5','7sus2','5','11','m11','13',
		'm13','maj13','7#9','7b9','7b5b9','7#11', 
		'7b9b13','7#9#11', '13b9', '13b9b5'
	];
	this.count = 0;

	var init = function(){
		if(!teoria){
			console.error('Poco requires teoria.');
		}
		poco.count = 0;
		for(var i in roots){
			for(var v in variations){

				var chordname = roots[i]+variations[v];
				var chord = teoria.chord(chordname),
				notes = chord.notes();

				// Calculate inversions
				for(var t = 0 ; t<notes.length ; t++){
					
					notes = invert(notes, t);
					var key = [];

					for(var z in notes){
						var n = notes[z];
						key.push(n.name()+n.accidental());
					}

					var newname = t>0 ? chordname + ('/'+notes[0].name().toUpperCase()+notes[0].accidental()) : chordname;
					// Fix teoria key alignment
					replace(key,'bb','a#');
					replace(key,'c#','db');

					key = key.join('-');
					var entry = table[key];

					if(!entry){
						table[key] = {name: newname, t: chord, othernames:[], inversion:t};
					}else{
						// Overwrite previous inversions with closer match
						if(t<entry.inversion){
							entry.othernames.push(entry.name);
							entry.name = newname;
							entry.inversion = t;
							table.chord = chord;
						}else{
							entry.othernames.push(newname);
						}
					}
					poco.count++;
				}
			}
		}
	};

	var invert = function(notes, inversion){
		if(inversion>0){
			for(var z in notes){
				var k = notes[z];
				var nam = k.name();
				var acc = k.accidental();
				var fullName = nam + acc;
				notes[z] = teoria.note(fullName);
			}
			return rotate(notes, 1);
		}else{
			return notes;
		}
	};

	var rotate = function(arr, n) {
		if(n===0){
			return arr;
		}
		return arr.slice(n, arr.length).concat(arr.slice(0, n));
	};

	var destroy = function(){
		table = {};
	};

	var replace = function(arr, needle, text){
		var i = arr.indexOf(needle);
		if (~i) {
		    arr[i] = text;
		}
	};

	var find = function(arr){
		return table[arr.join('-').toLowerCase()];
	};


	return {
		init:init,
		destroy:destroy,
		count:this.count,
		find:find
	};

})();