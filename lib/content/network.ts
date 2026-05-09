export type NetworkTool = {
  name: string;
  url: string;
  description: string;
  status: "live" | "soon";
};

export const networkTools: NetworkTool[] = [
  {
    name: "kdpcover.pro",
    url: "https://kdpcover.pro",
    description: "Precision spine width and cover dimension calculator for Amazon KDP.",
    status: "live",
  },
];
