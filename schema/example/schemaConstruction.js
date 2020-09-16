// @flow strict
const s = require('../');

const userSchema = s.idSchema('User', s.nameSchema('User', 'A person', s.objectSchema([
  ['id', s.idSchema('UserID', s.nameSchema('User ID', 'A unique string that references a user', s.stringSchema()))],
  ['age', s.numberSchema()],
  ['type', s.unionSchema([
    s.stringLiteralSchema('admin'),
    s.stringLiteralSchema('normie'),
  ])],
  ['pets', s.optionalSchema(s.arraySchema(s.stringSchema()))]
])));

const attackSchema = s.unionSchema([
  s.objectSchema([
    ['type', s.stringLiteralSchema('ranged weapon')]
  ]),
  s.objectSchema([
    ['type', s.stringLiteralSchema('melee weapon')]
  ]),
  s.objectSchema([
    ['type', s.stringLiteralSchema('ranged spell')]
  ]),
  s.objectSchema([
    ['type', s.stringLiteralSchema('melee spell')]
  ]),
]);

console.log(JSON.stringify(s.toJSONSchemaDocument(userSchema)));