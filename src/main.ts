import { GraphCanvas } from './graph-cavnas'
import './style.css'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const graphCanvas = new GraphCanvas('canvas')
