#!/bin/bash

# Replace motion-v imports with simple ref usage
find app -name "*.vue" -type f -exec sed -i "s/import { useMotion } from 'motion-v'/\/\/ Removed motion-v import/g" {} \;
find app -name "*.vue" -type f -exec sed -i "s/useMotion(.*)/\/\/ Removed useMotion call/g" {} \;

# Fix types imports to use #imports or full path
find app -name "*.vue" -type f -exec sed -i "s/import.*from '~\/types'/import type { Message, MessageReaction, SharedFile, FileTransfer } from '#imports'/g" {} \;
find app -name "*.ts" -type f -exec sed -i "s/import.*from '~\/types'/import type { Message, MediaState, SharedFile, FileTransfer } from '#imports'/g" {} \;

echo "Type fixes applied. Now run bun install to fix remaining issues."
