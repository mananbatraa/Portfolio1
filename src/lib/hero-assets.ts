// The six acts the hero laptop plays as you scroll, with relative spans.
// Section heights in the page follow the same spans.

export type Segment = {
  id: "deconstruct" | "reassemble" | "orbit" | "bridge" | "detail" | "reveal";
  span: number;
};

export const HERO_SEGMENTS: Segment[] = [
  { id: "deconstruct", span: 6 },
  { id: "reassemble", span: 6 },
  { id: "orbit", span: 6 },
  { id: "bridge", span: 5 },
  { id: "detail", span: 6 },
  { id: "reveal", span: 6 },
];
