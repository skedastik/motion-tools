# motion-tools

Various homespun After Effects scripts that work on M1 silicon.

## loop-selected-layers

Infinitely loop the selected layer using Time Remapping, extending its outpoint to the end of the composition's timeline.

I use this mainly as a replacement for looping hand-drawn animation footage via the Interpret Footage feature. As of 2022-06-28, Interpret Footage is poorly optimized. Every repetition of the looped footage is rendered in RAM preview, rather than simply replaying the cached footage. This makes previewing 4K boil frames painfully slow. Looping footage via Time Remapping yields much faster results.

## keyframe-nav-next + keyframe-nav-prev

Go to the next/previous keyframe in the currently selected layer.
