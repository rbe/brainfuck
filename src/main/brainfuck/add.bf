This example has been written by feider
Feel free to do with it whatever you want

,           reading the first summand
> ,         reading the second summand
> ++++ +++++ +++++ +++++ +++++ +++++ ++++++ +++++ +++++ +++   adding 48 to the third cell
[           loop for decreasing the character values to the real values
    <-      decreasing the second cell
    <-      decreasing the first cell
    >>>+    setting the 4th cell to 48 for later use
    <-      decreasing the third cell
]
<           going back to second cell
[
    <+      adding 1 to the first summand
    >-      subtracting 1 from the second summand
]           when the second cell is 0; the loop stops
>>          going to 4th cell
[           loop for increasing the first summands value to the character value
    <<<+    increasing the first cell
    >>>-    decreasing the 4th cell
]
<<<         going back to first cell
.           output first summand ( = sum)
