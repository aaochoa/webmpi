#!/bin/bash
### waiting to be exist file

FILES=$(find ./ -type f | wc -l)
ALL=$(($1 * 2 + 5)) # * 2 error and output files +4 (log file + checkfile + binary + temp.c + sub.sub)
while [ $FILES -lt $ALL  ]; # less than
do
  sleep 3
  FILES=$(find ./ -type f | wc -l)
done
#echo "file already exists, continuing"
echo "::::::::::::::::::::::::::::::::::::::: OUT FILES :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::";
cat outfile.*;   
echo "::::::::::::::::::::::::::::::::::::::: ERROR FILES :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::";
cat errfile.*;
echo "::::::::::::::::::::::::::::::::::::::: LOGFILE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::";
cat logfile;


