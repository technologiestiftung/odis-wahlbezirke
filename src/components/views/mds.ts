import {mul, pow, div, svd, sqrt, add, transpose} from 'numeric';

// Based on https://github.com/benfred/mds.js?files=1
export const mds = (distances, dimensions) => {
    dimensions = dimensions || 2;

    // square distances
    const M = mul(-0.5, pow(distances, 2));

    // double centre the rows/columns
    const mean = (A) => { return div(add.apply(null, A), A.length); };
    const rowMeans = mean(M);
    const colMeans = mean(transpose(M));
    const totalMean = mean(rowMeans);

    for (let i = 0; i < M.length; ++i) {
        for (let j =0; j < M[0].length; ++j) {
            M[i][j] += totalMean - rowMeans[i] - colMeans[j];
        }
    }

    // take the SVD of the double centred matrix, and return the
    // points from it
    const ret = svd(M);
    const eigenValues = sqrt(ret.S);

    return ret.U.map((row) => {
        return mul(row, eigenValues).splice(0, dimensions);
    });
}