
String.prototype.capitalize = function(){
	return this[0].toUpperCase() + this.substring(1);
};

$(function() { 
"use strict";


MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {

	$(".loading-indicator").hide();
	$(".page-container").show();
	$("body").css("background-color", "#EEEEEE");
	
	var piano = function() {
		var self = this;
		
		// Constants
		self.pianoSize = 7;
		self.notes = [["c","b#"], ["db", "c#"], ["d"], ["eb", "d#"], ["e", "fb"], ["f", "e#"], ["gb", "f#"], ["g"], ["ab", "g#"], ["a"], ["bb", "a#"], ["b", "cb"]];
		self.whitenotes = ["c", "d", "e", "f", "g", "a", "b"];
		self.velocity = 80;
		
		// Fields
		self.currentChord;
		self.chordIndex = 0;
		
		// Constructor
		self.init = function() {
			$("textarea").val("Ebm7/Bb octave 3\nAb7 octave 3\nDb7/B octave 3\nGbM7/Bb octave 3\nCm7(b5)/Bb octave 3\nBM7/Bb octave 2\nBb7(#5)/Ab octave 2");
			//$("textarea").val("Dm9/F no root\nG13 octave 2\nCM9/E octave 3 no root\nA7(b9)/G octave 2 no root");
			//$("textarea").val("CM7\nFM7\nCM7\nFM7\nEbM7\nAbM7\nEbM7\nAbM7\nG7\nCM7");
			//$("textarea").val("C/E\nGm7/Bb\nF");

			self.buildPiano();
			$("textarea").change(self.btnReset);
			$("button.btnReset").click(self.btnReset);
			$("button.btnNext").click(self.btnNext);
			$("button.btnPrev").click(self.btnPrev);
			$("button.btnPlay").click(self.btnPlay);
			self.btnReset();
		}
		
		// Reset button click
		self.btnReset = function() {
			self.chordIndex = 0;
			$(".highlight").removeClass("highlight");
			self.chordArray = self.getChordArray();
			self.highlightCurrentChord();
			self.play(self.currentChord);
		}
	
		// Next button click
		self.btnNext = function() {
			if (self.chordIndex == self.chordArray.length-1)
				self.chordIndex = -1;
			$(".highlight").removeClass("highlight");
			self.chordIndex++;
			self.highlightCurrentChord();
			self.play(self.currentChord);
		}
		
		self.btnPrev = function() {
			if (self.chordIndex == 0)
				self.chordIndex = 1;
			$(".highlight").removeClass("highlight");
			self.chordIndex--;
			self.highlightCurrentChord();
			self.play(self.currentChord);
		}
		
		self.btnPlay = function() {
			self.play(self.currentChord);
		}
		
		// Highlight current chord
		self.highlightCurrentChord = function() {
			self.currentChord = self.parseChord(self.chordArray[self.chordIndex]);
			self.highlightChord(self.currentChord);
			$(".chordName").text(self.currentChord.name.capitalize());
			$(".rootName").text(self.currentChord.root.capitalize());
			$(".third").text(self.currentChord.third.capitalize());
			$(".fifth").text(self.currentChord.fifth.capitalize());
			$(".seventh").text(self.currentChord.seventh.capitalize());
		}
		
		// Play chord
		self.play = function(chord) {							
			$.each(chord.audioNotes, function(index, value) {
				value = value[0].toUpperCase() + value.substring(1);
				MIDI.noteOn(0, MIDI.keyToNote[value], self.velocity, 0);	
			});
		}
		
		// Build Piano
		self.buildPiano = function() {
		
			// white keys
			var whitekeys = [];

			for (var i = 1; i < self.pianoSize; i++) {
				$.each(self.whitenotes, function(index, value) {
					$.merge(whitekeys, $("<div />").addClass("whitekey").addClass(value + i))
				});
			}
			
			var whitekeycontainer = $("<div />").addClass("whitekeycontainer").append(whitekeys);
			$(".piano").append(whitekeycontainer);
			
			// black keys
			var blackkeycontainer = $("<div />").addClass("blackkeycontainer");

			for (var i = 1; i < self.pianoSize; i++) {
				var twos = $("<div />").addClass("blackkey2setcontainer");
				var db = $("<div />").addClass("blackkey").addClass("db" + i).addClass("cs" + i).css("margin-left", "1.7%");
				var eb = $("<div />").addClass("blackkey").addClass("eb" + i).addClass("ds" + i).css("margin-left", "0.6%");
				var gb = $("<div />").addClass("blackkey").addClass("gb" + i).addClass("fs" + i).css("margin-left", "2.35%");
				var ab = $("<div />").addClass("blackkey").addClass("ab" + i).addClass("gs" + i).css("margin-left", "0.55%");
				var bb = $("<div />").addClass("blackkey").addClass("bb" + i).addClass("as" + i).css("margin-left", "0.55%").css("margin-right", "0.7%");
				blackkeycontainer.append(db).append(eb).append(gb).append(ab).append(bb);
			}
			
			$(".piano").append(blackkeycontainer);
		}
		
		// Parse Chord. Returns a chord object
		self.parseChord = function(chord) {
			var chordObject = {};
			chordObject.intervals = [];
			
			var regex = /^([A-G])(#|b)?(min|maj|aug|dim|sus|m|M)?(7|9|13)?(\(b5\)|\(#5\)|\(add9\)|\(b9\))?(\/)?([A-G])?(#|##|b|bb)?(?:\soctave\s)?([1-8])?\s?(no\sroot)?\s?(double\sroot)?\s?(lower|higher)?/;
			var match = regex.exec(chord);
			
			if (match[2])
				chordObject.root = match[1] + match[2];
			else
				chordObject.root = match[1];
				
			chordObject.accidental = match[2];
			chordObject.chord = match[3];
			chordObject.extension = match[4];
			chordObject.extension2 = match[5];
			chordObject.isSlashChord = match[6] != undefined;
			
			if (match[8])
				chordObject.slash = match[7] + match[8];
			else 
				chordObject.slash = match[7];
				
			chordObject.octave = match[9] ? match[9] : 3;
			chordObject.noRoot = match[10];
			chordObject.doubleRoot = match[11];
			chordObject.doubleRootPos = match[12];
		
			chordObject.name = chord;
			
			chordObject.rootAndOctave = self.getNote(chord) + chordObject.octave;
			
			chordObject.fifth = self.getNote(self.add(chordObject.rootAndOctave, 7));
			chordObject.seventh = self.getNote(self.getNote(self.add(chordObject.rootAndOctave, 11)));
			
			
			// console.log(match, chordObject);
			
			// No Root
			if (!chordObject.noRoot)
				chordObject.intervals.push(0);
				
			// Double Root
			if (chordObject.doubleRoot && chordObject.doubleRootPos == "higher") {
				chordObject.intervals.push(0);
				chordObject.intervals.push(-12);
			}
			else if (chordObject.doubleRoot && chordObject.doubleRootPos == "lower") {
				chordObject.intervals.push(-24);
				chordObject.intervals.push(-36);
			} else //if (chordObject.doubleRoot) {
				{chordObject.intervals.push(-12);
				chordObject.intervals.push(-24);
			}

			if (chordObject.chord == "maj" || chordObject.chord == "M" || chordObject.chord == undefined) {
				chordObject.third = self.getNote(self.add(chordObject.rootAndOctave, 4));
				chordObject.intervals.push(4);
			}
			else if (chordObject.chord == "min" || chordObject.chord == "m") {
				chordObject.third = self.getNote(self.add(chordObject.rootAndOctave, 3));
				chordObject.intervals.push(3);
			}
			else {
				if (chordObject.extension == "13")
					chordObject.intervals.push(4);
			}
			
			if (chordObject.extension != "13")
				chordObject.intervals.push(7);
		
			if (chordObject.extension2 == "(b5)")
				chordObject.intervals.push(6);
			else if (chordObject.extension2 == "(#5)")
				chordObject.intervals.push(8);
			else if (chordObject.extension2 == "(add9)")
				chordObject.intervals.push(14);
			
			switch(chordObject.extension) {
				case "7":
				if (chordObject.chord == "maj" || chordObject.chord == "M") {
					chordObject.intervals.push(11);
				}
				else {
					chordObject.intervals.push(10);
				}
					
				if (chordObject.extension2 == "(b9)")
					chordObject.intervals.push(13);
					break;
				case "9":
				if (chordObject.chord == "major" || chordObject.chord == "M")
					chordObject.intervals.push(11);
				else
					chordObject.intervals.push(10);
				chordObject.intervals.push(14);
				break;
				case "11":
				break;
				case "13":
					chordObject.intervals.push(10);
					chordObject.intervals.push(16);
					chordObject.intervals.push(21);
				break;
			}

			// Slash chord
			if (chordObject.isSlashChord) {
				var diff = self.getPosition(chordObject.rootAndOctave, chordObject.slash);
				chordObject.intervals = $.map(chordObject.intervals, function(value, index) {
					return value < diff ? value + 12 : value;
				});
				chordObject.intervals.unshift(diff);
			}

			return chordObject;			
		}
		
		// Transpose Chord
		self.transposeChord = function(chord, num) {
			chord.root = self.add(chord.root, num);
			return chord;
		}
		
		// Add
		self.add = function(note, num) {
			var currentOctave = self.getOctave(note);
			var currentNote = self.getNote(note);
			var newIndex;
			
			$.each(self.notes, function(index, value) {
				if (value.indexOf(currentNote) != -1) {
					newIndex = index + num;
				}
			});
			
			var quotient = Math.floor(newIndex / 12);
			var remainder = newIndex % 12;
			var targetOctave = (currentOctave + quotient);
			remainder = remainder < 0 ? 12 + remainder : remainder;
			var targetNote = self.notes[remainder][0] + targetOctave;
			return targetNote;
		}
		
		// Get the position of a note relative to the root
		self.getPosition = function(root, note) {
			root = self.getNote(root);
			note = self.getNote(note);
			var rootIndex, noteIndex;
			
			$.each(self.notes, function(index, value) {
				if (value.indexOf(root) != -1)
					rootIndex = index;
					
				if (value.indexOf(note) != -1)
					noteIndex = index;
			});
			
			var diff = noteIndex - rootIndex;

			if (diff < 0)
				noteIndex += 12;				
				
			diff = noteIndex - rootIndex;
			return diff;
		}
			
		// Get Octave - Cb3 -> 3
		self.getOctave = function(note) {
			return parseInt(note[1] == "b" || note[1] == "#" ? note[2] : note[1]);
		}
		
		// Get Note - Cb3 -> Cb
		self.getNote = function(note) {
			note = note.toLowerCase();
			return note[1] == "b" || note[1] == "#" ? note[0] + note[1] : note[0];
		}
		
		// Get chord array from input textarea
		self.getChordArray = function() {
			var array = $("textarea").val().split("\n");
			array = $.map(array, function(value, index) { return $.trim(value); });
			return array;
		}
		
		// Highlight Chord
		self.highlightChord = function(chordObject) {
			chordObject.audioNotes = [];
			$.each(chordObject.intervals, function(index, value) {
				var note = self.add(chordObject.rootAndOctave, value);
				note = note.replace("#", "s");
				$("." + note).addClass("highlight");
				chordObject.audioNotes.push(note);
			});
		}
		
		self.init();
	}
	
	var instance = new piano();
}
});
});