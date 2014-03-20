First, we need to analyze the composition of the painting and transform it in a 3D world. The mondrian pattern consists of straight lines with color red, yellow, and blue. To simplify, we get rid of colors and this is how it looks:

![Without color](/project_images/mondrian_step1.jpg "Without color")

It seems there are broken lines but with some rules to follow. We later connect all the lines and it get pretty easy to understand now.

![Connect lines](/project_images/mondrian_step2.jpg "Connect lines")

Now we know it can be divided into rows and columns, so a nested loop can do the trick. The tricky thing is to determine which two cube should be merged together. We decide to randomize the width and height of each cube and merge it simply by chance. Each cube has 1/10 chance to be colored as red, yellow, or blue. 
