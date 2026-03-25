export const EXAMPLES = [
  {
    name: 'Hello, World!',
    desc: 'Classic annotated hello world',
    input: '',
    code: `++++++++++
[
  > +++++++
  > ++++++++++
  > +++
  > +
  <<<< -
]                    prepare cells
> ++ .               H
> + .                e
+++++++ .            l
.                    l
+++ .                o
> ++ .               (space)
<< +++++++++++++++ . W
> .                  o
+++ .                r
------ .             l
-------- .           d
> + .                !
> .                  (newline)`,
  },
  {
    name: 'Add Two Digits',
    desc: 'Reads two digit chars, prints their sum',
    input: '35',
    code: `,           read first digit
> ,         read second digit
> ++++++++++++++++++++++++++++++++++++++++++++++++++++++++   add 48+10 = 58 to cell 2
[           loop: subtract 1 from each of cells 0,1,2
    <-
    <-
    >>>+    cell 3 gets 48 for restoring offset
    <-
]
<           go to cell 1
[
    <+      carry remainder to cell 0
    >-
]
>>          go to cell 3 (holds 48 offset)
[
    <<<+    restore ASCII offset
    >>>-
]
<<<         go to cell 0
.           print result`,
  },
  {
    name: 'art of coding',
    desc: 'Prints "art of coding"',
    input: '',
    code: `+++++ +++++          cell 0  +10
[                    enter loop
  > +++++ ++++       cell 1   +9
  > +++++ +++++      cell 2  +10
  > +++++ +++++ +    cell 3  +11
  > +++              cell 4   +3
  <<<< -             cell 0   -1
]                    loop until cell 0 == 0
> +++++ ++ .         cell 1   90 + 7 =  97  a
>> ++++ .            cell 3  110 + 4 = 114  r
++ .                 cell 3  114 + 2 = 116  t
> ++ .               cell 4   30 + 2 =  32  SPACE
< ----- .            cell 3  116 - 5 = 111  o
< ++ .               cell 2  100 + 2 = 102  f
>> .                 cell 4             32  SPACE
<<< ++ .             cell 1   97 + 2 =  99  c
>> .                 cell 3            111  o
<< + .               cell 1   99 + 1 = 100  d
+++++ .              cell 1  100 + 5 = 105  i
>> - .               cell 3  111 - 1 = 110  n
<< -- .              cell 1  105 - 2 = 103  g`,
  },
  {
    name: 'Cat (Echo Input)',
    desc: 'Copies stdin to stdout',
    input: 'Hello, World!',
    code: `,[.,]`,
  },
  {
    name: 'ROT13',
    desc: 'Applies ROT13 cipher to input',
    input: 'Hello, World!',
    code: `-,+[-[>>++++[>++++++++<-]<+<-[>+>[->]>[<<]>-]<[>+<-]>[-[-<]>[<+>-]>]<+>>]<]`,
  },
  {
    name: 'Fibonacci',
    desc: 'Prints Fibonacci numbers (ASCII art style)',
    input: '',
    code: `>++++++++++>+>+[
[+++++[>++++++++<-]>.<++++++[>--------<-]+<<<]>.>>[
[-]<[>+<-]>>[<<+>+>-]<[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
[>+<-[>+<-[>+<-[>[-]>+>+<<<-[>+<-]]]]]]]]]]]+>>>
]<<<
]`,
  },
  {
    name: 'Reverse Input',
    desc: 'Reads all input and prints it reversed',
    input: 'Brainfuck!',
    code: `>,[>,]<[.<]`,
  },
  {
    name: 'Sierpinski Triangle',
    desc: 'Draws a Sierpinski triangle',
    input: '',
    code: `++++++++[>+>++++<<-]>++>>+<[-[>>+<<-]+>>]>+[-<<<[
->[+[-]+>++>>>-<<]<[<]>>++++++[<<+++++>>-]+<<++.[-]<<
]>.>+[>>]>+]`,
  },
]
