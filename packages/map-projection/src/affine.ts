// Fit an affine transform x = a*lng + b*lat + c, y = d*lng + e*lat + f
// via least-squares over anchor points. Requires >= 3 anchors.

export interface AnchorPoint {
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export type AffineMatrix = [number, number, number, number, number, number];

export interface AffineTransform {
  kind: "affine";
  matrix: AffineMatrix; // [a, b, c, d, e, f]
  width: number;
  height: number;
}

// Solve a 6x6 normal equations system for two affines using naive Gauss-Jordan.
export function fitAffine(anchors: AnchorPoint[]): AffineMatrix {
  if (anchors.length < 3) {
    throw new Error("fitAffine requires at least 3 anchors");
  }

  // For x: minimize sum (a*lng + b*lat + c - x)^2 → 3x3 solve
  // For y: minimize sum (d*lng + e*lat + f - y)^2 → 3x3 solve
  const solve3 = (target: (a: AnchorPoint) => number): [number, number, number] => {
    // Sums
    let Sll = 0, Slt = 0, Sl = 0, Stt = 0, St = 0, Sn = anchors.length;
    let Sxl = 0, Sxt = 0, Sx = 0;
    for (const a of anchors) {
      const lng = a.lng;
      const lat = a.lat;
      const v = target(a);
      Sll += lng * lng;
      Slt += lng * lat;
      Sl += lng;
      Stt += lat * lat;
      St += lat;
      Sxl += v * lng;
      Sxt += v * lat;
      Sx += v;
    }
    const A: number[][] = [
      [Sll, Slt, Sl, Sxl],
      [Slt, Stt, St, Sxt],
      [Sl, St, Sn, Sx],
    ];
    // Gauss-Jordan
    for (let i = 0; i < 3; i++) {
      // find pivot
      let p = i;
      for (let r = i + 1; r < 3; r++) {
        if (Math.abs(A[r]![i]!) > Math.abs(A[p]![i]!)) p = r;
      }
      [A[i], A[p]] = [A[p]!, A[i]!];
      const piv = A[i]![i]!;
      if (Math.abs(piv) < 1e-12) throw new Error("singular anchor matrix");
      for (let c = i; c < 4; c++) A[i]![c] = A[i]![c]! / piv;
      for (let r = 0; r < 3; r++) {
        if (r === i) continue;
        const f = A[r]![i]!;
        for (let c = i; c < 4; c++) A[r]![c] = A[r]![c]! - f * A[i]![c]!;
      }
    }
    return [A[0]![3]!, A[1]![3]!, A[2]![3]!];
  };

  const [a, b, c] = solve3((p) => p.x);
  const [d, e, f] = solve3((p) => p.y);
  return [a, b, c, d, e, f];
}

export function project(matrix: AffineMatrix, lat: number, lng: number): { x: number; y: number } {
  const [a, b, c, d, e, f] = matrix;
  return { x: a * lng + b * lat + c, y: d * lng + e * lat + f };
}
