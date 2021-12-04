import type { Cluster } from 'model';

export function countries(clusters: Cluster[]): Cluster[] {
    const countries: string[] = [];
    const onePerCountry: Cluster[] = [];
    clusters.forEach(cluster => {
        if (!countries.includes(cluster.countryCode)) {
            countries.push(cluster.countryCode);
            onePerCountry.push(cluster);
        }
    });
    return onePerCountry;
}
