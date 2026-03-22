import * as THREE from 'three';

export interface HighlightUniforms {
  uHighlightCenter: { value: THREE.Vector3 };
  uBrainCenter: { value: THREE.Vector3 };
  uHighlightColor: { value: THREE.Color };
  uHighlightRadius: { value: number };
  uHighlightStrength: { value: number };
  uHighlightMode: { value: number }; // 0 = off, 1 = sphere, 2 = surface
}

export function createHighlightMaterial(opts: {
  color: THREE.Color;
  metalness: number;
  roughness: number;
}): { material: THREE.MeshStandardMaterial; uniforms: HighlightUniforms } {
  const uniforms: HighlightUniforms = {
    uHighlightCenter: { value: new THREE.Vector3() },
    uBrainCenter: { value: new THREE.Vector3() },
    uHighlightColor: { value: new THREE.Color() },
    uHighlightRadius: { value: 1.0 },
    uHighlightStrength: { value: 0.0 },
    uHighlightMode: { value: 0 },
  };

  const material = new THREE.MeshStandardMaterial({
    color: opts.color.clone(),
    metalness: opts.metalness,
    roughness: opts.roughness,
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 0,
  });

  material.onBeforeCompile = (shader) => {
    // Merge our uniforms into the shader
    Object.assign(shader.uniforms, uniforms);

    // --- Vertex shader: pass world position to fragment ---
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vHighlightWorldPos;`,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      vHighlightWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
    );

    // --- Fragment shader: region-based emissive glow ---
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vHighlightWorldPos;
      uniform vec3 uHighlightCenter;
      uniform vec3 uBrainCenter;
      uniform vec3 uHighlightColor;
      uniform float uHighlightRadius;
      uniform float uHighlightStrength;
      uniform int uHighlightMode;`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>

      // Region highlight
      {
        float hlIntensity = 0.0;

        if (uHighlightMode == 1) {
          // Sphere mode: glow around a point
          float d = distance(vHighlightWorldPos, uHighlightCenter);
          hlIntensity = 1.0 - smoothstep(uHighlightRadius * 0.4, uHighlightRadius, d);
        } else if (uHighlightMode == 2) {
          // Surface mode: glow on outer surface (meningioma)
          float d = distance(vHighlightWorldPos, uBrainCenter);
          hlIntensity = smoothstep(uHighlightRadius * 0.8, uHighlightRadius, d);
        }

        hlIntensity *= uHighlightStrength;
        totalEmissiveRadiance += uHighlightColor * hlIntensity * 2.5;
      }`,
    );
  };

  material.customProgramCacheKey = () => 'brainHighlight';

  return { material, uniforms };
}
