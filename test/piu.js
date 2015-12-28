(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.piu = require('piu');
// window.Benchmark = require('benchmark');
// var teoria = require('teoria');
},{"piu":2}],2:[function(require,module,exports){
var triads = require('./lib/triads');
var infer = require('./lib/infer');
var name = require('./lib/name');

module.exports = exports = { infer: infer, triads: triads, name: name };

},{"./lib/infer":4,"./lib/name":5,"./lib/triads":6}],3:[function(require,module,exports){
// Return all combinations of k elements in set of length n
exports.k_combinations = function k_combinations(set, k) {
  var i, j, combs = [], head, tailcombs, n = set.length, x;

  if (k > n || k <= 0) return combs;
  if (k === n) return [set];
  if (k === 1) return set.map(function(el) { return [el]; });

  for (i = 0; i < (n - k + 1); i++) {
    head = [set[i]];
    tailcombs = k_combinations(set.slice(i + 1), k - 1);

    for (j = 0, x = tailcombs.length; j < x; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }

  return combs;
};

// Return all permutations of the set
exports.permutate = function permutate(set) {
  function p(set, index, callback) {
    // Swap elements i1 and i2 in array a[]
    function swap(a, i1, i2) {
      var t = a[i1];
      a[i1] = a[i2];
      a[i2] = t;
    }

    if (index == set.length - 1)
      callback(set);
    else {
      p(set, index + 1, callback);

      for (var i = index + 1; i < set.length; i++) {
        swap(set, i, index);
        p(set, index + 1, callback);
        swap(set, i, index);
      }
    }
  }

  if (!set || !set.length) return [];

  var permutations = [];
  p(set, 0, function(a) { permutations.push(a.slice(0)); });

  return permutations;
};

},{}],4:[function(require,module,exports){
var possibleTriads  = require('./triads')
  , combi           = require('./combinatorics');

module.exports = function infer(notes, enharmonics) {
  var triads, chords = [];

  if (enharmonics) {
    var n = notes.length;
    notes = notes.map(function(note) {
      return [note].concat(note.enharmonics());
    });

    // Flatten it
    notes = [].concat.apply([], notes);

    chords = combi.k_combinations(notes, n).map(function(notecombi) {
      return infer(notecombi);
    });

    return [].concat.apply([], chords);
  }

  // Special case for power-chords (which aren't actual chords)
  if (notes.length === 2) {
    var root = notes[0], interval = root.interval(notes[1])
      , val = interval.value(), num = Math.abs(val);

    if ((num !== 4 && num !== 5) || interval.quality() !== 'P')
      return [];

    if (val === -5 || val === 4)
      root = notes[1];

    return [{
      root: root.name().toUpperCase() + root.accidental(),
      type: '5',
      exts: []
    }];
  }

  triads = possibleTriads(notes);
  triads.forEach(function(triad) {
    var indexes = triad.notes.map(function(n) { return n.toString(true); });
    var chromas = triad.notes.map(function(n) { return n.chroma(); });
    var root = triad.notes[0], extensions = [];

    var exts = notes.filter(function(note) {
      return indexes.indexOf(note.toString(true)) === -1;
    });

    for (var i = 0, length = exts.length; i < length; i++) {
      var ext = exts[i];
      var interval = root.interval(ext);
      if (chromas.indexOf(ext.chroma()) !== -1 ||
          Math.abs(interval.qualityValue()) > 2) return;

      interval = interval.direction() === 'down' ?  interval.invert() : interval;
      var q = interval.quality();
      var num = interval.number();

      if (num === 2 || num === 4)
        interval.coord[0]++;
      else if (num === 3 && triad.type.indexOf('sus') !== -1)
        return; // No thirds in sus chords
      else if (q === 'A' && num !== 2 && num !== 4)
        return;
      else if (q === 'd' && num !== 4 && !(num === 7 && triad.type === 'dim'))
        return;
      else if (q === 'dd' || q === 'AA')
        return;

      extensions.push(interval);
    }

    // Sort descending
    extensions.sort(function(a, b) { return b.number() - a.number(); });

    chords.push({
      root: root.name().toUpperCase() + root.accidental(),
      type: triad.type,
      exts: extensions
    });
  });

  return chords;
};

},{"./combinatorics":3,"./triads":6}],5:[function(require,module,exports){
// Normal quality values
var normal = {
 '6': 1,
 '7': 0,
 '9': 1,
 '11': 0,
 '13': 1
};

// Return chord type and extensions in the correct order
function order(type, name) {
  if (type === '' || type === 'M') return name;
  if (type === 'm') return type + name;
  if (type === 'aug') return name + '#5';
  if (type === 'm#5') return 'm' + name + '#5';
  if (type === 'dim') return name === 'b7' ? 'dim7' : 'm' + name + 'b5';
  if (type === 'Mb5') return name + 'b5';
  else return name + type;
}

// Return (if necessary) the sign to prepend an extension
function sign(extension) {
  var num = extension.number().toString()
    , diff = normal[num] - extension.qualityValue();

  if (diff === 1)
    return 'b';
  if (diff === -1)
    return num === '7' ? 'maj' : '#';
  else
    return '';
}


module.exports = exports = function(chord) {
  var root = chord.root, type = chord.type, exts = chord.exts, rest;

  if (!exts.length) // Triad
    rest = type;
  else if (exts.length === 1) { // Tetrad
    var num = exts[0].number();
    var asign = sign(exts[0]);
    var name = (num === 6 || num === 7) ? (asign + num) : ('add' + asign + num);

    rest = order(type, name);
  } else {
    // TODO: Implement naming for higher order chords
    //console.log('chord', root, type, exts.toString());
  }


  if (/^[b#]/.test(rest))
    return root + '(' + rest + ')';
  else
    return root + rest;
};

},{}],6:[function(require,module,exports){
var combi = require('./combinatorics');

var kTriads = {
  '': ['M3', 'P5'],
  'm': ['m3', 'P5'],
  'aug': ['M3', 'A5'],
  'dim': ['m3', 'd5'],
  'sus2': ['M2', 'P5'],
  'sus4': ['P4', 'P5'],
  'sus2#5': ['M2', 'A5'],
  'sus2b5': ['M2', 'd5'],
  'sus4#5': ['P4', 'A5'],
  'sus4b5': ['P4', 'd5'],
  'Mb5': ['M3', 'd5'],
  'm#5': ['m3', 'A5']
};

function compareArray(first, second) {
  for (var i = 0, length = first.length; i < length; i++)
    if (first[i] !== second[i]) return false;

  return true;
}

// Get all possible triad combinations of a set of notes
module.exports = exports = function(notes) {
  var combs = [], triads = [], names = [], n = [], root, third, fifth, type;

  // Unique notes (for now, we handle all notes octave-agnostic)
  notes.forEach(function(note) {
    if (names.indexOf(note.toString(true)) === -1) {
      n.push(note);
      names.push(note.toString(true));
    }
  });

  // Get all k combinations and each of their permutations
  combi.k_combinations(n, 3).forEach(function(comb) {
    combi.permutate(comb).forEach(function(perm) {
      combs.push(perm);
    });
  });

  // Filter out triads with roots with double accidentals (Cx, Ebb, etc)
  combs
  .filter(function(triad) {
    return triad[0].name() !== triad[1].name() &&
           triad[0].name() !== triad[2].name() &&
           triad[1].name() !== triad[2].name() &&
           Math.abs(triad[0].accidentalValue()) < 2 &&
           Math.abs(triad[1].accidentalValue()) < 3 &&
           Math.abs(triad[2].accidentalValue()) < 3;
  })
  .forEach(function(triad) {
    root = triad[0];

    third = root.interval(triad[1]);
    third = third.direction() === 'down' ? third.invert().simple(true) : third.simple();
    fifth = root.interval(triad[2]);
    fifth = fifth.direction() === 'down' ? fifth.invert().simple(true) : fifth.simple();

    third = third.toString();
    fifth = fifth.toString();

    for (type in kTriads) {
      if (compareArray(kTriads[type], [third, fifth]))
        triads.push({ notes: triad, type: type });
    }
  });

  return triads;
};

},{"./combinatorics":3}]},{},[1]);
