import { index, layout, route, RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  layout('./routes/layout.tsx', [
    route('/pokemon', './routes/pokemon/list.tsx'),
    route('/pokemon/:pokemonId', './routes/pokemon/id.tsx'),
  ]),
] satisfies RouteConfig
