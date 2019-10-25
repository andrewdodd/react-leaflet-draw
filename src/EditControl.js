import { PropTypes } from 'prop-types'
import Draw from 'leaflet-draw' // eslint-disable-line
import { isEqual } from 'lodash'

import { withLeaflet, MapControl } from 'react-leaflet'
import L, { Map } from 'leaflet'

// import 'leaflet-draw/dist/leaflet.draw.css'

const eventHandlers = {
  onEdited: L.Draw.Event.EDITED,
  onCreated: L.Draw.Event.CREATED,
  onDeleted: L.Draw.Event.DELETED,

  onDrawStart: L.Draw.Event.DRAWSTART,
  onDrawStop: L.Draw.Event.DRAWSTOP,
  onDrawVertex: L.Draw.Event.DRAWVERTEX,

  onEditStart: L.Draw.Event.EDITSTART,
  onEditMove: L.Draw.Event.EDITMOVE,
  onEditResize: L.Draw.Event.EDITRESIZE,
  onEditVertex: L.Draw.Event.EDITVERTEX,
  onEditStop: L.Draw.Event.EDITSTOP,

  onDeleteStart: L.Draw.Event.DELETESTART,
  onDeleteStop: L.Draw.Event.DELETESTOP,

  onToolbarOpened: L.Draw.Event.TOOLBAROPENED,
  onToolbarCloser: L.Draw.Event.TOOLBARCLOSED,
  onMarkerContext: L.Draw.Event.MARKERCONTEXT
}

export const DrawPropTypes = PropTypes.shape({
  polyline: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  polygon: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  rectangle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  circle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  marker: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
})
export const EditPropTypes = PropTypes.shape({
  edit: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  remove: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  poly: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  allowIntersection: PropTypes.bool
})
export const PositionPropType = PropTypes.oneOf([
  'topright',
  'topleft',
  'bottomright',
  'bottomleft'
])

class EditControl extends MapControl {
  static propTypes = {
    ...Object.keys(eventHandlers).reduce((acc, val) => {
      acc[val] = PropTypes.func
      return acc
    }, {}),
    onMounted: PropTypes.func,
    onWillUnmount: PropTypes.func,
    draw: DrawPropTypes,
    edit: EditPropTypes,
    position: PositionPropType
  }

  static contextTypes = {
    map: PropTypes.instanceOf(Map),
    layerContainer: PropTypes.shape({
      addLayer: PropTypes.func.isRequired,
      removeLayer: PropTypes.func.isRequired
    })
  }

  componentDidMount () {
    const { onMounted, leaflet } = this.props
    const { map } = leaflet
    // register all event handlers for leaflet-draw
    for (const key in eventHandlers) {
      if (this.props[key]) {
        map.on(eventHandlers[key], this.props[key], this)
      }
    }
    super.componentDidMount()
    onMounted && onMounted(this.leafletElement)
  }

  componentWillUnmount () {
    const { map } = this.props.leaflet
    const { onWillUnmount } = this.props
    onWillUnmount && onWillUnmount(this.leafletElement)
    this.leafletElement.remove(map)

    for (const key in eventHandlers) {
      if (this.props[key]) {
        map.off(eventHandlers[key], this.props[key], this)
      }
    }
  }

  createLeafletElement () {
    return createDrawControl(this.props)
  }

  componentDidUpdate (prevProps) {
    // super updates positions if thats all that changed so call this first
    super.componentDidUpdate(prevProps)

    if (
      isEqual(this.props.draw, prevProps.draw) ||
      isEqual(this.props.edit, prevProps.edit) ||
      this.props.position !== prevProps.position
    ) {
      return
    }

    const { map } = this.props.leaflet

    this.leafletElement.remove(map)
    this.leafletElement = createDrawControl(this.props)
    this.leafletElement.addTo(map)
  }
}

function createDrawControl (props) {
  const { layerContainer } = props.leaflet
  const { draw, edit, position } = props
  const options = {
    edit: {
      ...edit,
      featureGroup: layerContainer
    }
  }

  if (draw) {
    // leaflet-draw mutates underlying object, so create a copy
    options.draw = { ...draw }
  }

  if (position) {
    options.position = position
  }

  return new L.Control.Draw(options) // eslint-disable-line
}

export default withLeaflet(EditControl)
