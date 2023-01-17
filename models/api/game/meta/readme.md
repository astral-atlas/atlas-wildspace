# Game Resource

Certain data types in Wildspace follow specific conventions. There are a set of objects
that all have "tags", "title", "id", "version" and other specific pieces of metadata. We
refer to those as a "Game Resource"

A "Game Resource Description" is a special type that bundles together relevant types,
such as the type of the resource itself, the type needed to update the resource. It's not
meant to be a real type.

A "Game Resource Spec" object defines a set of "Cast"s - that is, functions needed to
determine if an arbitrary object is of the correct type.