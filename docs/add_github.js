#!/usr/bin/env node

import { promises as fs } from 'fs';
const { writeFile } = fs;

const addGithub = async () => {
  try {
    await writeFile('./dist/CNAME', `docs.wildspace.astral-atlas.com`, 'utf-8');
  } catch (error) {
    console.error(error);
  }
} 

addGithub();