# motion-tools

Various homespun scripts to assist with animation using After Effects and Photoshop.

## After Effects

### loop-selected-layers

Infinitely loop the selected layer using Time Remapping, extending its outpoint to the end of the composition's timeline.

I use this mainly as a replacement for looping hand-drawn animation footage via the Interpret Footage feature. As of 2022-06-28, Interpret Footage is poorly optimized. Every repetition of the looped footage is rendered in RAM preview, rather than simply replaying the cached footage. This makes previewing 4K boil frames painfully slow. Looping footage via Time Remapping yields much faster results.

## keyframe-nav-layer-next + keyframe-nav-layer-prev

Go to the next/previous key in the currently selected layer. If keys are currently selected, only navigate between keys of selected properties.

### posterize-time

Apply a `posterizeTime(X)` expression to all selected properties where X is inputted via a prompt.

### shift-layer-to-playhead

Shift the currently selected layer(s) and all of its keys/markers in the timeline such that its start point is aligned with the playhead.

## Photoshop

⚠️ WARNING: These are extremely experimental.

### ps-select-layer-at-playhead

Select the layer in the currently selected layer group under the timeline playhead. This script does nothing if no layer in the currently selected layer group is under the playhead.

Known issues:
* This script will not work if the layer under the playhead is empty (has no pixel data).

### ps-add-animation-frame

Create a new layer matching the duration of the active layer, automatically advancing the playhead. The new layer is created after the active layer.
