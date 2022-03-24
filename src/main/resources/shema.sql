/*
 Три таблички

 Project
 -id(long ?)
 -name(string)
 updatedAt(date)
 -createdAt(date)
 -taskStates ( FOREIGN KEY)

 TaskState
 -id(long ?)
 -name(string)
 -leftTaskState
 -rightTaskState
 -createdAt(date)
 -ordinal (long ?)
 -task ( FOREIGN KEY)

 Task
 -id(long ?)
 -name(string)
 -createdAt(date)
 -description(string)

 */