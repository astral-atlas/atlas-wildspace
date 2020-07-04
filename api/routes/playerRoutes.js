import * as yup from 'yup';

const postPlayerSchema = yup.object({
  name: yup.string().required(),
  sharableSecret: yup.string().required(),
}).required();

const createPlayerRoutes = (playerService) => {
  const postPlayerHandler = async (query, body, headers) => {

  };

  return [
    { type: 'json', method: 'post', path: '/players', handler: postPlayerHandler }
  ]
};