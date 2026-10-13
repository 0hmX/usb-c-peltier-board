export interface GeneratedVia {name:string;net:string;x:number;y:number}
export interface GeneratedTrace {
  name:string;net:string;from:string;to:string;layer:string;width:number
  path:{x:number;y:number}[];rotation:number;origin:{x:number;y:number}
  pcbStraightLine?:boolean;maxLength?:number;maxExposedLength?:number;role?:string
}
export interface GeneratedCopper {vias:GeneratedVia[];traces:GeneratedTrace[]}
