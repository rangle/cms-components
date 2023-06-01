// @ts-nocheck
import { useEffect } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export type MountainAnimation = {
  width: number
  height: number
  widthSegments: number
  heightSegments: number
  children: any
  bgColor: {
    r: number
    g: number
    b: number
  }
  raycastColor: {
    r: number
    g: number
    b: number
  }
}

export type Props = MountainAnimation

// The scene is the background on which the animation is rendered
const scene = new THREE.Scene()
// The rendered creates the element to attach to the dom
const renderer = new THREE.WebGLRenderer()
// A raycaster is like a 3d beam being pointed from wherever the mouse is on the 3d space
const raycaster = new THREE.Raycaster()
// The camera is the angle and size of which you're viewing the scene
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)
// Zooms the camera out so we can actually see what is on the scene
camera.position.z = 50
// Gets rid of pixelated edges
renderer.setPixelRatio(devicePixelRatio)

// Sets a light on the front side of the scene
// Without a light, the scene will be completely black and look like nothing renders
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 1, 1)
scene.add(light)

// This will be used to track where the mouse point is
// Allows hover animations while you move the mouse
const mouse: { x: number | undefined; y: number | undefined } = {
  x: undefined,
  y: undefined
}

export const MountainAnimation = ({
  width,
  height,
  widthSegments,
  heightSegments,
  children,
  bgColor,
  raycastColor
}: Props) => {
  const world = {
    plane: {
      width,
      height,
      widthSegments,
      heightSegments
    }
  }

  // A geometry is the 3D shape that will be rendered to the scene
  // This one creates a plane. Different shapes can be accessed - see docs
  // The geometry also creates the vertices points of the 3d object
  const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )

  // A material is needed to fill in the space between the vertice points created in the geometry
  const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: true,
    vertexColors: true
  })
  // Creating a mesh is what connects the vertice points from the geometry and the fill from the material
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
  // Add this new mesh that is created to the scene so it can be rendered
  scene.add(planeMesh)

  // This function creates the randomized "mountains" in the animation
  // This is run once the window object has been accessed and the initial scene has been rendered to the dom
  function generatePlane() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
      world.plane.width,
      world.plane.height,
      world.plane.widthSegments,
      world.plane.heightSegments
    )

    // Vertice position randomization
    const { array } = planeMesh.geometry.attributes.position
    const randomValues = []
    for (let i = 0; i < array.length; i++) {
      if (i % 3 === 0) {
        const x = array[i]
        const y = array[i + 1]
        const z = array[i + 2]

        array[i] = x + (Math.random() - 0.5) * 3
        array[i + 1] = y + (Math.random() - 0.5) * 3
        array[i + 2] = z + (Math.random() - 0.5) * 5
      }

      randomValues.push(Math.random() * Math.PI * 2)
    }

    planeMesh.geometry.attributes.position.randomValues = randomValues

    planeMesh.geometry.attributes.position.originalPosition =
      planeMesh.geometry.attributes.position.array

    // Store an array of colors, based on the bgColor prop
    // These are saved in sets of 3, to account for how three.js takes r, g & b values
    const colors = []
    for (
      let index = 0;
      index < planeMesh.geometry.attributes.position.count;
      index++
    ) {
      colors.push(bgColor.r, bgColor.g, bgColor.b)
    }

    // The planeMesh geometry has an optional attribute called color
    // This is not added my default, but can be set on the object
    // It MUST take a specific type of array called a Buffer attribute & Float23Array
    // Above we map through the count of vertice positions to create an array of r, g & b values
    // These are put in a set of 3, which is why that is the second argument in the new BufferAttribute
    planeMesh.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    )
  }

  let frame = 0

  // To make the mountains slightly move, we add an animate function that consistently runs
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    frame += 0.01

    const { array, originalPosition, randomValues } =
      planeMesh.geometry.attributes.position

    // The loop goes through the vertices that were initially rendered and slightly moves them to a random spot
    // This random spot is determined by the randomValues array we added in the generatePlane function
    for (let index = 0; index < array.length; index += 3) {
      // x coordinate
      array[index] =
        originalPosition[index] + Math.cos(frame + randomValues[index]) * 0.003
      // y coordinate
      array[index + 1] =
        originalPosition[index + 1] +
        Math.sin(frame + randomValues[index + 1]) * 0.003
    }

    // You must call needsUpdate to get the scene to animate and move, otherwise it will stay static
    planeMesh.geometry.attributes.position.needsUpdate = true

    // This code tracks whether your mouse is over your geometry in your scene
    raycaster.setFromCamera(mouse, camera)
    // Get the data from the mesh with where your mouse is
    const intersects = raycaster.intersectObject(planeMesh)

    if (intersects.length > 0) {
      const { color } = intersects[0].object.geometry.attributes

      // Vertice 1
      color.setX(intersects[0].face.a, 0.1)
      color.setY(intersects[0].face.a, 0.5)
      color.setZ(intersects[0].face.a, 1)

      // Vertice 2
      color.setX(intersects[0].face.b, 0.1)
      color.setY(intersects[0].face.b, 0.5)
      color.setZ(intersects[0].face.b, 1)

      // Vertice 3
      color.setX(intersects[0].face.c, 0.1)
      color.setY(intersects[0].face.c, 0.5)
      color.setZ(intersects[0].face.c, 1)

      color.needsUpdate = true

      const initialColor = {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b
      }

      const hoverColor = {
        r: raycastColor.r,
        g: raycastColor.g,
        b: raycastColor.b
      }

      // Use the gsap library to animate a color change when the mouse hovers over a certain place in the scene
      gsap.to(hoverColor, {
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        onUpdate: () => {
          // Vertice 1
          color.setX(intersects[0].face.a, hoverColor.r)
          color.setY(intersects[0].face.a, hoverColor.g)
          color.setZ(intersects[0].face.a, hoverColor.b)

          // Vertice 2
          color.setX(intersects[0].face.b, hoverColor.r)
          color.setY(intersects[0].face.b, hoverColor.g)
          color.setZ(intersects[0].face.b, hoverColor.b)

          // Vertice 3
          color.setX(intersects[0].face.c, hoverColor.r)
          color.setY(intersects[0].face.c, hoverColor.g)
          color.setZ(intersects[0].face.c, hoverColor.b)

          color.needsUpdate = true
        }
      })
    }
  }

  useEffect(() => {
    const mountainWrapper = document.getElementById('mountain-wrapper')
    // Adds the three.js element to the dom
    mountainWrapper.appendChild(renderer.domElement)

    // Get the width & height of the wrapper
    const wrapperWidth = mountainWrapper.offsetWidth
    const wrapperHeight = mountainWrapper.offsetHeight

    // Sets the size of the scene to fit within the wrapper element
    renderer.setSize(wrapperWidth, wrapperHeight)
    // Initiate the plane geometry
    generatePlane()
    // Initiate the animation
    animate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  addEventListener('mousemove', (event) => {
    const mountainWrapper = document.getElementById('mountain-wrapper')
    const wrapperWidth = mountainWrapper.offsetWidth
    const wrapperHeight = mountainWrapper.offsetHeight

    // The center point needs to be in the center of the mesh, not the top left corner of the screen
    // This math sets both the x & y values properly
    mouse.x = (event.clientX / wrapperWidth) * 2 - 1
    mouse.y = -(event.clientY / wrapperHeight) * 2 + 1
  })

  addEventListener('resize', () => {
    const mountainWrapper = document.getElementById('mountain-wrapper')
    const wrapperWidth = mountainWrapper.offsetWidth
    const wrapperHeight = mountainWrapper.offsetHeight

    // Need to update the camera aspect ratio and the size of the scene to render whenever the screen size is updated
    camera.aspect = wrapperWidth / wrapperHeight
    camera.updateProjectionMatrix()
    renderer.setSize(wrapperWidth, wrapperHeight)
  })

  return (
    <div
      id='mountain-wrapper'
      className='h-screen max-h-full bg-slate-200 relative'
    >
      <div className='absolute h-full w-full flex justify-center items-center'>
        {children}
      </div>
    </div>
  )
}
