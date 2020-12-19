// @flow strict
const { assert, colorReporter } = require('@lukekaalim/test');
const { createMemoryTable, createMemoryJoinTable } = require('./main.js');

const assertMemoryTable = async () => {
  const table = createMemoryTable/*::<{ value: string }>*/('example');

  await table.insert([{ value: 'row1' }, { value: 'row2' }]);
  await table.update({ value: 'row2' }, { value: 'row3' })

  const [firstRow] = await table.select({ value: 'row1' });
  const [secondRow] = await table.select({ value: 'row3' });

  const allRows = await table.select({});
  
  return assert('Memory Table', [
    assert('Can select inserted table', firstRow.value === 'row1'),
    assert('Can select other inserted table', secondRow.value === 'row3'),
    assert('Can select all rows', allRows.length === 2),
  ]);
};

const assertMemoryJoinTable = async () => {
  const tableA = createMemoryTable/*::<{ cool: string, share: string }>*/('a');
  const tableB = createMemoryTable/*::<{ sweet: string, share: string }>*/('b');
  await tableA.insert([{ share: '1', cool: '20' }, { share: '2', cool: '40' }]);
  await tableB.insert([{ share: '1', sweet: '20', }, {  share: '3', sweet: '40' }]);

  const joinTable = createMemoryJoinTable(tableA, tableB,
    (a, b) => a.share === b.share ? ({ share: a.share, sweet: b.sweet, cool: a.cool }) : null);
  
  const [share1Rows] = await joinTable.select({ 'share': '1' });
  const coolRows = await joinTable.select({ 'a.cool': '40' });

  return assert('Memory Join Table', [
    assert('Can select joined table', share1Rows.sweet === '20'),
    assert('Should not return any entries that cannot be joined', coolRows.length == 0),
  ]);
};

const testPackage = async () => {
  const assertion = assert('@astral-atlas/table', [
    await assertMemoryTable(),
    await assertMemoryJoinTable(),
  ]);
  console.log(colorReporter(assertion));
};

testPackage();