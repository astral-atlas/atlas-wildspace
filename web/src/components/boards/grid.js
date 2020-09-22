// @flow
import { h } from 'preact';
import { createDragHandlers } from '../../lib/drag';
import { useCamera } from '../../hooks/useCamera';

const GridBoard = () => {
  useCamera()
};

export {
  GridBoard,
};
