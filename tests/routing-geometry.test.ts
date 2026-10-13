import { describe, expect, test } from "bun:test"
import { CopperGeometry, segmentDistance } from "../scripts/routing-geometry"

describe("routing geometry", () => {
  test("crossing diagonal copper and disjoint collinear segments", () => {
    expect(segmentDistance({x:0,y:0},{x:2,y:2},{x:0,y:2},{x:2,y:0})).toBe(0)
    expect(segmentDistance({x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0})).toBe(1)
  })
  test("the middle of a route must clear a foreign pad", () => {
    const g=new CopperGeometry()
    g.add({kind:"rect",net:"OTHER",layers:["top"],x:0,y:0,width:1,height:1,pad:true})
    expect(g.clear({x:-2,y:0},{x:2,y:0},"top",.2,"SIGNAL")).toBe(false)
    expect(g.clear({x:-2,y:1},{x:2,y:1},"top",.2,"SIGNAL")).toBe(true)
    expect(g.clear({x:-2,y:0},{x:2,y:0},"bottom",.2,"SIGNAL")).toBe(true)
  })
  test("ordinary through vias must clear every layer and stay off same-net pads", () => {
    const g=new CopperGeometry()
    g.add({kind:"rect",net:"POWER",layers:["bottom"],x:0,y:0,width:1,height:1,pad:true})
    expect(g.clear({x:0,y:0},{x:0,y:0},"top",.7,"POWER",true)).toBe(false)
    expect(g.clear({x:0,y:0},{x:0,y:0},"top",.7,"OTHER",true)).toBe(false)
  })
  test("foreign traces clear the drill as well as the annulus", () => {
    const g=new CopperGeometry();g.addVia({x:0,y:0},"POWER")
    expect(g.clear({x:-2,y:.6},{x:2,y:.6},"bottom",.2,"OTHER")).toBe(false)
    expect(g.clear({x:-2,y:.8},{x:2,y:.8},"bottom",.2,"OTHER")).toBe(true)
    expect(g.clear({x:0,y:0},{x:2,y:0},"top",.2,"POWER")).toBe(true)
  })
  test("mounting washers and board edges remain clear", () => {
    const g=new CopperGeometry()
    g.add({kind:"circle",layers:["top","bottom"],x:49,y:36,radius:4})
    expect(g.clear({x:44,y:36},{x:54,y:36},"top",.2,"SIGNAL")).toBe(false)
    expect(g.clear({x:54.45,y:0},{x:54.45,y:2},"top",.2,"SIGNAL")).toBe(false)
  })
  test("a reserved USB reference region admits antipads but excludes crossing bottom traces", () => {
    const g=new CopperGeometry()
    g.add({kind:"polygon",net:"GND",layers:["bottom"],x:0,y:0,traceOnly:true,
      points:[{x:-1,y:-1},{x:1,y:-1},{x:1,y:1},{x:-1,y:1}]})
    expect(g.clear({x:-2,y:0},{x:2,y:0},"bottom",.2,"CONTROL")).toBe(false)
    expect(g.clear({x:-2,y:0},{x:2,y:0},"inner2",.2,"CONTROL")).toBe(true)
    expect(g.clear({x:0,y:0},{x:0,y:0},"top",.7,"CONTROL",true)).toBe(true)
  })
  test("concave pad copper does not fill its empty bounding-box corner", () => {
    const g=new CopperGeometry()
    g.add({kind:"polygon",net:"OTHER",layers:["top"],x:0,y:0,pad:true,
      points:[{x:0,y:0},{x:3,y:0},{x:3,y:1},{x:1,y:1},{x:1,y:3},{x:0,y:3}]})
    expect(g.clear({x:2,y:2},{x:2.5,y:2.5},"top",.2,"CONTROL")).toBe(true)
    expect(g.clear({x:.5,y:2},{x:2,y:2},"top",.2,"CONTROL")).toBe(false)
  })
})
