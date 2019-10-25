import React, { Component } from 'react'
import {
  Map as LeafletMap,
  TileLayer,
  Circle,
  Rectangle,
  Marker,
  CircleMarker,
  Polyline,
  Polygon
} from 'react-leaflet'
import L from 'leaflet'
import { EditControlFeatureGroup } from '../src'

const controlSettings = {
  draw: {
    // rectangle: false,
    // marker: false,
    // circle: false,
    // circlemarker: false,
    polygon: {
      allowIntersection: false,
      drawError: {
        color: '#E1E100',
        message: '<strong>Wups</strong> shapes cannot intersect'
      }
    }
    // polyline: false
  },
  edit: {
    edit: {
      // NB: edit has a nested edit!
      selectedPathOptions: {
        maintainColor: true,
        fillOpacity: 0.5
        // fillColor: nullm
      }
    },
    poly: {
      allowIntersection: false,
      drawError: {
        color: 'fuchsia',
        message: '<strong>Wups</strong> shapes cannot intersect'
      }
    }
  },
  position: 'topright'
}

export default class EditControlExample extends Component {
  constructor (props) {
    super(props)

    const elementsById = new Map()
    elementsById.set(1, {
      type: 'polygon',
      positions: [[51.51, -0.1], [51.5, -0.06], [51.52, -0.03]]
    })
    elementsById.set(2, {
      type: 'polyline',
      positions: [[51.5, -0.04], [51.49, -0.02], [51.51, 0], [51.52, -0.02]]
    })
    elementsById.set(3, {
      type: 'circlemarker',
      center: [51.5, -0.08],
      radius: 10
    })
    elementsById.set(4, { type: 'marker', position: [51.5, -0.07] })
    elementsById.set(5, { type: 'circle', center: [51.5, -0.05], radius: 600 })
    elementsById.set(6, {
      type: 'rectangle',
      bounds: [[51.49, -0.1], [51.48, -0.06]]
    })
    this.state = { elementsById }
  }

  _getHighestId = () => {
    // Include 0 to make sure we always have a valid id
    return Math.max(0, ...this.state.elementsById.keys())
  }

  _handleCreated = evt => {
    const { layerType, layer } = evt
    if (layerType === 'polyline') {
      alert('I DO NOT ADD POLYLINE')
      return
    }

    const newMap = new Map(this.state.elementsById.entries())
    const newId = this._getHighestId() + 1
    const props = {
      polygon: l => ({ positions: l.getLatLngs()[0] }),
      circlemarker: l => ({ center: l.getLatLng(), radius: l.getRadius() }),
      marker: l => ({ position: l.getLatLng() }),
      circle: l => ({ center: l.getLatLng(), radius: l.getRadius() }),
      rectangle: l => ({ bounds: l.getBounds() })
    }[layerType](layer)

    newMap.set(newId, { type: layerType, ...props })

    this.setState({ elementsById: newMap })
  }

  _handleEdited = (elem, layer, evt) => {
    const id = Number.parseInt(elem.key)
    const item = this.state.elementsById.get(id)
    if (!item) {
      console.log('No matching item, perhaps a race? skip')
      return
    }

    const layerType = item.type
    const newMap = new Map(this.state.elementsById.entries())
    const newId = this._getHighestId() + 1
    const newProps = {
      polygon: l => ({ positions: l.getLatLngs() }),
      polyline: l => ({ positions: l.getLatLngs() }),
      circlemarker: l => ({ center: l.getLatLng(), radius: l.getRadius() }),
      marker: l => ({ position: l.getLatLng() }),
      circle: l => ({ center: l.getLatLng(), radius: l.getRadius() }),
      rectangle: l => null // copy existing item
    }[layerType](layer)

    if (item.type === 'rectangle') {
      alert('I DO NOT EDIT RECTANGLES!')
      // To ensure the underlying leaflet draw state remains in sync, change the id of this element
      newMap.set(newId, newMap.get(id))
    } else {
      newMap.set(newId, { type: layerType, ...newProps })
    }

    newMap.delete(id)
    this.setState({ elementsById: newMap })
  }

  _handleDeleted = (elem, layer, evt) => {
    const id = Number.parseInt(elem.key)
    const item = this.state.elementsById.get(id)
    if (!item) {
      console.log('No matching item, perhaps a race? skip')
      return
    }

    const newMap = new Map(this.state.elementsById.entries())

    if (item.type.indexOf('marker') !== -1) {
      alert('I DO NOT DELETE MARKERS!')
      // To ensure the underlying leaflet draw state remains in sync, change the id of this element
      const newId = this._getHighestId() + 1
      newMap.set(newId, newMap.get(id))
    }

    newMap.delete(id)
    this.setState({ elementsById: newMap })
  }

  _handleActivityStarted = e => {
    console.log('started', e)
    const { flagStartedEditing } = this.props
    if (flagStartedEditing) {
      flagStartedEditing()
    }
  }
  _handleActivityStopped = e => {
    console.log('stopped', e)
    const { flagStoppedEditing } = this.props
    if (flagStoppedEditing) {
      flagStoppedEditing()
    }
  }

  render () {
    console.log('state', this.state)
    return (
      <LeafletMap center={{ lat: 51.5, lng: -0.048 }} zoom={13}>
        <TileLayer
          attribution='&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        <EditControlFeatureGroup
          controlProps={controlSettings}
          onCreated={this._handleCreated}
          onEdited={this._handleEdited}
          onDeleted={this._handleDeleted}
          onActivityStarted={this._handleActivityStarted}
          onActivityStopped={this._handleActivityStopped}
        >
          {[...this.state.elementsById.keys()].map(id => {
            const { type, ...props } = this.state.elementsById.get(id)
            const Element = {
              polygon: Polygon,
              polyline: Polyline,
              circlemarker: CircleMarker,
              marker: Marker,
              circle: Circle,
              rectangle: Rectangle
            }[type]
            return <Element key={id} {...props} />
          })}
        </EditControlFeatureGroup>
      </LeafletMap>
    )
  }
}
