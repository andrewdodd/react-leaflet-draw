import React, { Component } from 'react'
import ReactDOM from 'react-dom'
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
    rectangle: false,
    marker: false,
    circle: false,
    circlemarker: false,
    polygon: false,
    polyline: false
  },
  edit: {edit:false, remove:false},
}

export default class EditControlExample extends Component {
  constructor (props) {
    super(props)
    this.mapRef = React.createRef()
    this.editControlFeatureGroupRef = React.createRef()

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
    this.state = { elementsById, editing: false}
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

    newMap.set(newId, { type: layerType, ...newProps })
    newMap.delete(id)
    this.setState({ elementsById: newMap })
  }

  _handleDeleted = (elem, layer, evt) => {
    const id = Number.parseInt(elem.key)
    this._deleteShape(id)
  }

  _deleteShape = id  => {
    const item = this.state.elementsById.get(id)
    if (!item) {
      console.log('No matching item, perhaps a race? skip')
      return
    }

    const newMap = new Map(this.state.elementsById.entries())
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

  _handleStartEditing = e => {
    const ec = this.editControlFeatureGroupRef.current._editControlRef.current
    const fg = this.editControlFeatureGroupRef.current._featureGroupRef.current
    const layers = fg.leafletElement.getLayers()
    for (var idx in layers) {
      var layer = layers[idx]
      if (layer.editing) {
        layer.editing.enable()
      }
    }
    this.setState({editing:true})
  }

  _handleStopEditing = e => {
    const fg = this.editControlFeatureGroupRef.current._featureGroupRef.current
    const layers = fg.leafletElement.getLayers()
    for (var idx in layers) {
      var layer = layers[idx]
      if (layer.editing) {
        layer.editing.disable()
      }
    }
    this.setState({editing:false})
  }

  _drawCircle = e => {
    const ec = this.editControlFeatureGroupRef.current._editControlRef.current
    const map = ec.leafletElement._map
    const circle = new L.Draw.Circle(map)
    circle.enable()
  }
  _drawPolygon = e => {
    const ec = this.editControlFeatureGroupRef.current._editControlRef.current
    const map = ec.leafletElement._map
    const circle = new L.Draw.Polygon(map)
    circle.enable()
  }

  render () {
    console.log('state', this.state)
    const { editing } = this.state
    return (
      <div>
        <LeafletMap center={{ lat: 51.5, lng: -0.048 }} zoom={13}
          ref={this.mapRef}
        >
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
            ref={this.editControlFeatureGroupRef}
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
              return <Element key={id} {...props} editing={true}/>
            })}
          </EditControlFeatureGroup>
        </LeafletMap>
        <div style={{width: "80%", margin: "1em auto"}}>
          <button 
            key={'editButton'} 
            onClick={editing ? this._handleStopEditing : this._handleStartEditing}
          >
            {editing ? "Stop" : "Start"} Editing
          </button>
          <button key={'drawCircle'} onClick={this._drawCircle}>Draw Circle</button>
          <button key={'drawPolygon'} onClick={this._drawPolygon}>Draw Polygon</button>
          <ul>
            {[...this.state.elementsById.keys()].map(id => {
              const { type, ...props } = this.state.elementsById.get(id)
              return (
                <li key={id}>
                  <button onClick={() => this._deleteShape(id)}>Delete</button>
                  {id} - {type}: {JSON.stringify(props)}
                </li>)
            })
            }
          </ul>
        </div>
      </div>
    )
  }
}
