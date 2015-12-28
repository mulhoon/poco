# poco ♫
Reverse chord lookup at lightning speed in Javascript (1kb)

## How?
**poco** uses [teoria](https://github.com/saebekassebil/teoria) to generate an indexed table of all chords, including inversions. This table is used to look up chords and therefore doesn’t run *any* calculations. This make Poco over **400x faster** (800x on iOS) at chord recognition than [piu](https://github.com/saebekassebil/piu).

## Why?
I'm a huge fan of [teoria](https://github.com/saebekassebil/teoria). **poco** was created before I discovered [piu](https://github.com/saebekassebil/piu). Both use different methods to lookup chords. **poco** happens to be faster and smaller, so I thought I'd share it.

## Usage

Initialise poco
``` javascript
	poco.init();
```

Find a chord
``` javascript
	poco.find(['a','c','e','g']);
	
	/* returns...
	{
		name: 'Amin7', 
		othernames:['C6/A'], 
		inversion:0, 
		t: [teoria chord object]
	}
	*/
```

#License

The MIT License

Copyright (c) 2010-2014 Nic Mulvaney

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


