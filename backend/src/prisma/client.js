import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pool from '../database/pool.js';

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
