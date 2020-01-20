# Fork of React-Leaflet-Draw

This is a fork of [React-Leaflet-Draw](https://github.com/alex3165/react-leaflet-draw), a component that wraps [leaflet-draw](https://github.com/Leaflet/Leaflet.draw) in order to work with [React-Leaflet](https://github.com/PaulLeCam/react-leaflet).

This fork is mainly to provide an alternative [MapControl](https://react-leaflet.js.org/docs/en/components.html#mapcontrol) component that more plainly wraps the Leafet.draw control and does not provide its own internal [FeatureGroup](https://react-leaflet.js.org/docs/en/components.html#featuregroup). I implemented this, as the existing control did not work well with the redux store I was using for state. It also provides a component that has its own internal FeatureGroup for convenience.

**NB:** If the original repo wants to incorporate these changes, that's fine by me, but I think that given the tradeoff between the size of this code and the potential to break the existing client code it is probably easier to just copy-paste this code if you need it (or use the `@andrewdodd/react-leaflet-draw` dep instead).

## Install

```
npm install @andrewdodd/react-leaflet-draw
```

## Getting started

First, include leaflet-draw styles in your project

```html
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.3/leaflet.draw.css"/>
```

or by including

```
node_modules/leaflet-draw/dist/leaflet.draw.css
```
or perhaps forcing the css to be included (this one is for my own benefit, in case I forget!)

```
import 'leaflet-draw/dist/leaflet.draw.css'
```

As per the original React-Leaflet-Draw, it is important to wrap EditControl component in a FeatureGroup component from `react-leaflet`. However, interfacing to the EditControl component is complex enough that I have supplied a 'helper' container to do this. Have a look at the [example](https://github.com/andrewdodd/react-leaflet-draw/tree/master/example) for more info!

NB: The code for this repo is not very long, so I would recommend reading it to get a better feel for what is happening. However, in summary:

 - [EditControl](https://github.com/andrewdodd/react-leaflet-draw/blob/master/src/EditControl.js) - Acts as a go-between (an adapter) for the "React" way and the underlying Leaflet/Leaflet.draw way. It creates and manages the MapControl, it registers and unregisters from the Leaflet.draw events.
 - [EditControlFeatureGroup](https://github.com/andrewdodd/react-leaflet-draw/blob/master/src/FeatureGroup.js) - Combines both the necessary FeatureGroup and the LeafletDrawControl into a single component that manages the Leaflet.draw state changes, React-Leaflet child components and the underlying Leaflet.draw elements.

## Running the examples

There are a few examples in the repo, which show the various levels of complexity you need to deal with (and why this plugin is the way it is).

 1. Basic example - this just shows how to use the EditControlFeatureGroup in a map, but does not attempt to manage any state.
  
  * Run `npm run example-basic`
  * And go to http://localhost:8000

 2. Full example - this shows how to manage the various events coming out of the EditControlFeatureGroup, how to update your application state, and how to pass configuration through to the underlying leaflet.draw plugin.

  * Run `npm run example-full`
  * And go to http://localhost:8000

 3. Custom example - this shows how to create an application that uses only programatically controlled functionality to manage the underlying leaflet.draw plugin. It does some pretty scary things, mainly because Leaflet and leaflet.draw are very DOM oriented, while React and React-Leavlet are not. I'm not really convinced that this is a good idea...but if you *have* to use Leaflet and leaflet.draw, and you *have* to use something other than the out-of-the-box controls I guess it is ok?

  * Run `npm run example-custom`
  * And go to http://localhost:8000
